import express from 'express';
var router = express.Router();

import postsRouter from './controllers/posts.js';
import urlsRouter from './controllers/urls.js';
import usersRouter from './users.js';
import commentRouter from './controllers/comments.js';
import userInfoRouter from './controllers/userInfoController.js';

router.use('/posts', postsRouter);
router.use('/urls', urlsRouter);
router.use('/users', usersRouter);
router.use('/comments', commentRouter);
router.use('/userinfo', userInfoRouter);

export default router;