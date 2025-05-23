import express from "express";

var router = express.Router();

import getURLPreview from "../utils/urlPreviews.js";

router.post("/", async function (req, res, next) {   
    if (req.session.isAuthenticated) {
        try {
            console.log("Request url is " + req.body.url);
            console.log("Request description is " + req.body.description);
            console.log("Request username is " + req.session.account.username);

            const newPost = new req.models.Post({
                url: req.body.url,
                description: req.body.description,
                username: req.session.account.username,  
                created_date: new Date(),
            });

            console.log("New post is " + newPost);

            await newPost.save();
            res.json({ status: "success" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: "error", error: error.message });
        }
    } else {
        res.status(401).json({ status: "error", error: "not logged in" });
    }
});

router.get("/", async function (req, res, next) {
    try {
        let query = {};
        if (req.query.username) {
            query.username = req.query.username;
        }
        
        const allPosts = await req.models.Post.find(query).sort({ created_date: -1 });

        const result = await Promise.all(
            allPosts.map(async (post) => { 
                try {
                    console.log("post id is " + post._id);
                    const id = post._id;
                    return {
                        description: post.description,
                        username: post.username,
                        htmlPreview: (await getURLPreview(post.url)).toString(), id: id, created_date: post.created_date, likes: post.likes
                    };
                } catch (error) {
                    console.log("Error making the post is" + error);
                    return { description: "Error loading website", htmlPreview: error.message };
                }
            })
        );
        console.log("Result is " + result);
        res.status(200).json(result)
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.delete("/", async function (req, res, next) {
    if (req.session.isAuthenticated) {
        try {
            console.log("Request's body is " + req.body.postID);
            let query = {};
            query._id = req.body.postID

            let commentQuery = {};
            commentQuery.post = req.body.postID
            // delete the post
            await req.models.Post.deleteOne(query);
            
            // delete all the comments TODO come back after comment controller is made
            await req.models.Comment.deleteMany(commentQuery);

            res.json({"status": "success"})
        } catch (error) {
           console.log("Error in post is " + error);
            res.status(500).json({"status": "error", "error": "you can only delete your own posts"})
        }
    } else {
        return res.status(401).json({ status: "error", error: "not logged in" });
    }
});


export default router;