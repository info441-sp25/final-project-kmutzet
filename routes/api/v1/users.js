import express from 'express';
var router = express.Router();

router.get('/myIdentity', function (req, res, next) {
  if (req.session.isAuthenticated) {
    res.status(200).json({
      status: "loggedin",
      userInfo: {
        name: req.session.account.name,
        username: req.session.account.username
      }
    })
  } else {
    res.json({status: "loggedout"});
  }
})

export default router;
