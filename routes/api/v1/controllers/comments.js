import express from "express";

var router = express.Router();


router.get('/', async function(req, res, next) {
    try {
        let query = {};
        query.post = req.query.postID;

        const allComments = await req.models.Comment.find(query)

        let result = await Promise.all(
            allComments.map(async comments => { 
                try {
                    return { _id: comments._id, username: comments.username, comment: comments.comment, post: comments.post, 
                        created_date: comments.created_date, __v: comments.__v };
                } catch (error) {
                    console.log("Error making the post is" + error);
                    return { description: "Error loading website", htmlPreview: error.message };
                }
            })
        );
        console.log("Result is " + result);
        res.status(200).json(result)
    } catch (error){
        console.log("Error in get is " + error);
        res.status(500).json({"status": "error", "error": error})
    }
});

router.post('/', async function(req, res, next) {
    if(req.session.isAuthenticated){
        try {
            console.log("Request description is " + req.body.newComment);
            console.log("Request id is " + req.body.postID);

            const newComment = req.models.Comment({
                username: req.session.account.username,    
                comment: req.body.newComment,
                created_date: new Date(),
                post: req.body.postID
            });

            console.log("New comment is " + newComment);

            await newComment.save()
            console.log("comment saved");
            res.json({"status": "success"})

        } catch (error) {
            console.log("Error in post is " + error);
            res.status(500).json({"status": "error", "error": error})
        }
    } else {
        res.status(401).json({status: "error", error: "not logged in"})
    }
});

export default router;