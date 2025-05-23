import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import sessions from 'express-session';
import WebAppAuthProvider from 'msal-node-wrapper';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import models from './models.js';
require('dotenv').config();
const secret = process.env.SECRET_KEY;


import v1Router from './routes/api/v1/apiv.js';
import usersRouter from './routes/api/v1/users.js';

const authConfig = {
    auth: {
        clientId: "41429171-0e61-42d3-b009-ce37a6e8e639",
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


app.use('/api/v1/', v1Router);


app.use(authProvider.interactionErrorHandler());

export default app;