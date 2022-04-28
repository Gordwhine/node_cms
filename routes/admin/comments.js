const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const { userAuthenticated } = require('../../helpers/authentication');

// Once app gets to this router, replace the layout with this 
router.all('/*', userAuthenticated, (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
});

// Route that display all comments
router.get('/', (req, res)=>{
	// display comment of the current loggin user
	Comment.find({user: req.user.id}).populate('user')
		   .then(comments=>{
		res.render('admin/comments', {comments: comments});
	});
});


// Route that saves comments
router.post('/', (req, res)=>{
	Post.findOne({_id: req.body.id}).then(post=>{
		const newComment = new Comment({
			//user is comming from session
			user: req.user.id,
			body: req.body.body
		});
		post.comments.push(newComment);
		post.save().then(savedPost=>{
			newComment.save().then(savedComment=>{
				req.flash('success_message', 'Your Comment will be review in due time!');
				res.redirect(`/post/${post.id}`);
			});
		});
	});
});


// Route that delete comments
router.delete('/:id', (req, res)=>{
    Comment.remove({_id: req.params.id}).then(deleteItem=>{
    	// Delete the comment referecing this post
    	Post.findOneAndUpdate({comments: req.params.id}, {$pull: {comments: req.params.id}}, (err, data)=>{
    		if(err) console.log(err);
    		req.flash('success_message', 'Comment was successfully deleted');
        	res.redirect('/admin/comments');
    	});
    });
}); 


// Route that approve comments
router.post('/approve-comment', (req, res)=>{
	Comment.findByIdAndUpdate(req.body.id, {$set: {approveComment: req.body.approveComment}}, (err, result)=>{
		if(err) return err;
		res.send(result);
	});
});


module.exports = router;