import express from 'express';

var router = express.Router();

import getURLPreview from '../utils/urlPreviews.js';

//TODO: Add handlers here

router.get('/preview', async (req, res) => {
    console.log("Started preview hander with URL " + req.query.url);
    res.send((await getURLPreview(req.query.url)).toString());
});

export default router;