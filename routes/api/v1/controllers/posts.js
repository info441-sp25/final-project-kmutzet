import express from "express";

var router = express.Router();

import getURLPreview from "../utils/urlPreviews.js";

console.log("✅ posts.js loaded");


router.put("/test", (req, res) => {
  console.log("✅ Test PUT /test reached!");
  res.json({ message: "PUT /test works!" });
});

router.post("/", async function (req, res, next) {   
    if (req.session.isAuthenticated) {
        try {
            console.log("Request url is " + req.body.url);
            console.log("Request description is " + req.body.description);
            console.log("Request username is " + req.session.account.username);

            let tagsArray = [];
            if (Array.isArray(req.body.tags)) {
                tagsArray = req.body.tags;
            } else if (typeof req.body.tags === 'string') {
                tagsArray = req.body.tags.split(/[\s,]+/).filter(Boolean);
            }

            const newPost = new req.models.Post({
                imageURLs: req.body.imageURLs, 
                description: req.body.description,
                htmlPreview: req.body.htmlPreview,
                username: req.session.account.username,
                boardID: req.body.boardID,
                tags: tagsArray,
                created_date: new Date(),
            });

            console.log("Request tags:", req.body.tags);

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

router.put("/", async function (req, res, next) {
  console.log("PUT /api/v1/posts called");
  console.log("Request body:", req.body);

  if (!req.session.isAuthenticated) {
    console.log("User not authenticated");
    return res.status(401).json({ status: "error", error: "Not logged in" });
  }

  try {
    const { postID, description } = req.body;
    console.log(`Updating post with ID: ${postID}, new description: ${description}`);

    const post = await req.models.Post.findById(postID);
    if (!post) {
      console.log("Post not found");
      return res.status(404).json({ status: "error", error: "Post not found" });
    }

    if (post.username !== req.session.account.username) {
      console.log("Unauthorized edit attempt by:", req.session.account.username);
      return res.status(403).json({ status: "error", error: "Unauthorized to edit this post" });
    }

    post.description = description;
    await post.save();

    console.log("Post updated successfully");
    res.json({ status: "success" });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ status: "error", error: "Server error during update" });
  }
});



router.get("/", async function (req, res, next) {
    try {
        let query = {};

        if (req.query.likedBy) {
            query.likes = { $in: [req.query.likedBy] };
        } else if (req.query.username) {
            query.username = req.query.username;
        }

        // If no query params, query = {} returns all posts

        const allPosts = await req.models.Post.find(query).sort({ created_date: -1 });

        const result = await Promise.all(
            allPosts.map(async (post) => {
                try {
                    return {
                        description: post.description,
                        username: post.username,
                        imageURLs: post.imageURLs,
                        id: post._id,
                        created_date: post.created_date,
                        likes: post.likes,
                        tags: post.tags,
                    };
                } catch (error) {
                    console.log("Error making the post is" + error);
                    return { description: "Error loading website", htmlPreview: error.message };
                }
            })
        );

        res.status(200).json(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ status: "error", error: error.message });
    }
});

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Split query by spaces or commas, trim whitespace, remove empty strings
    const keywords = query
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    // Mongo text search only supports a string, so join back for $text
    const searchString = keywords.join(' ');

    // Search using MongoDB text index on description and tags
    const posts = await req.models.Post.find(
      { $text: { $search: searchString } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' }, created_date: -1 })
      .limit(50);

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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