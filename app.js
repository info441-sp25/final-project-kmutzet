import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import sessions from 'express-session';
import WebAppAuthProvider from 'msal-node-wrapper';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import models from './models.js';
import dotenv from 'dotenv';
dotenv.config();

const secret = process.env.SECRET_KEY;


import v1Router from './routes/api/v1/apiv.js';
import usersRouter from './routes/api/v1/users.js';

import postsRouterDirect from './routes/api/v1/controllers/posts.js';


const authConfig = {
    auth: {
        clientId: "2833ad02-2877-4752-a4c9-a6c485ed4be9",
        authority: "https://login.microsoftonline.com/f6b6dd5b-f02f-441a-99a0-162ac5060bd2",
        clientSecret: secret,
        redirectUri: "/redirect"
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: 3,
        }
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = express();

app.enable('trust proxy');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    req.models = models;
    next();
});

const oneDay = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: secret, //secret not secret id
    saveUninitialized: true,
    resave: false,
    cookie: { maxAge: oneDay }
}))

const authProvider = await WebAppAuthProvider.WebAppAuthProvider.initialize(authConfig);
app.use(authProvider.authenticate());

app.get('/signin', (req, res, next) => {
    return req.authContext.login({
        postLoginRedirectUri: "/",
    })(req, res, next);
})

app.get('/signout', (req, res, next) => {
    return req.authContext.logout({
        postLogoutRedirectUri: "/",
    })(req, res, next);
})


app.use('/api/v1', v1Router);
app.use('/debug-posts', postsRouterDirect);

app.use(express.static(path.join(__dirname, 'public')));

app.use(authProvider.interactionErrorHandler());

// Catch-all route for debugging unhandled paths
app.use((req, res, next) => {
  console.warn(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  if (req.accepts('json')) {
    res.status(404).json({ error: 'Not Found', path: req.originalUrl });
  } else {
    res.status(404).send(`<pre>Cannot ${req.method} ${req.originalUrl}</pre>`);
  }
});


// Add this after your other `app.use` calls:
export default app;