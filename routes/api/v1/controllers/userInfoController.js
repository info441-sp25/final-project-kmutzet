import express from "express";
import { model } from "mongoose";

var router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        let userInfo = await req.models.UserInfo.findOne({ username: req.query.username });
        if (!userInfo) {
            userInfo = new req.models.UserInfo({
                username: req.query.username,
                profileBio: ""
            });
            await userInfo.save();
            return res.json({ status: "success", profileBio: userInfo.profileBio });
        }
        res.json({ status: "success", profileBio: userInfo.profileBio });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ status: "error", error: error.message });
    }
})

router.post('/', async (req, res, next) => {
    try {
        let userInfo = await req.models.UserInfo.findOne({ username: req.session.account.username });
        if (!userInfo) {
            userInfo = new req.models.UserInfo({
                username: req.session.account.username,
                profileBio: req.body.profileBio
            });
        } else {
        userInfo.profileBio = req.body.profileBio;
        }

        await userInfo.save();
        res.json({ status: "success" });
    } catch (error) {
        console.error('Error updating user info:', error);
        res.status(500).json({ status: "error", error: error.message });
    }
})
export default router;