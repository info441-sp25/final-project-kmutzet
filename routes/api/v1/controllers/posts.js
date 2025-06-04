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
                imageURLs: req.body.imageURLs, 
                description: req.body.description,
                htmlPreview: req.body.htmlPreview,
                username: req.session.account.username,
                boardID: req.body.boardID,
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

router.post("/like", async function (req, res, next) {  
  if (req.session.isAuthenticated) {
      try {
          const username = req.session.account.username;
          const post = await req.models.Post.findById(req.body.postID);

          if (!post.likes.includes(username)) {
              post.likes.push(username);
              await post.save();
              res.json({ status: "success" });
          }
      } catch (error) {
          console.error(error);
          res.status(500).json({ status: "error", error: error.message });
      }
  } else {
      return res.status(401).json({ status: "error", error: "not logged in" });
  }
})

router.post("/unlike", async function (req, res, next) {
  if (req.session.isAuthenticated) {
      try {
          const username = req.session.account.username;
          const post = await req.models.Post.findById(req.body.postID);

          if (post.likes.includes(username)) {
              post.likes = post.likes.filter((like) => like !== username);
              await post.save();
              res.json({ status: "success" });
          }
      } catch (error) {
          console.error(error);
          res.status(500).json({ status: "error", error: error.message });
      }
  } else {    
      return res.status(401).json({ status: "error", error: "not logged in" });
  }
})


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
                        imageURLs: post.imageURLs,
                        id: post._id,
                        created_date: post.created_date,
                        likes: post.likes,
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
            const postID = req.body.postID;
            const post = await req.models.Post.findById(postID);

            if (!post) {
                return res.status(404).json({ status: "error", error: "Post not found" });
            }

            if (post.username !== req.session.account.username) {
                return res.status(403).json({ status: "error", error: "Unauthorized to delete this post" });
            }

            await req.models.Post.deleteOne({ _id: postID });
            await req.models.Comment.deleteMany({ post: postID });

            res.json({ status: "success" });
        } catch (error) {
            console.log("Error in post deletion: " + error);
            res.status(500).json({ status: "error", error: "Server error during deletion" });
        }
    } else {
        return res.status(401).json({ status: "error", error: "Not logged in" });
    }
});



export default router;