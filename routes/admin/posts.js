const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const { isEmpty, uploadDir } = require('../../helpers/upload-helpers');// not using the isEmpty var
const fs = require('fs');
const { userAuthenticated } = require('../../helpers/authentication');

// Once app gets to this router, replace the layout with this 
router.all('/*', userAuthenticated, (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
});

// render the index page routes for posts that is included in the app.js
// populate() fxn replaces the id from the model with the field name of the specify 
router.get('/', (req, res)=> {
    //Query and attach a promise incase it dosen't bring back a result
    Post.find({}).populate('category')
        .then(posts=>{
        res.render('admin/posts', {posts: posts});
    }).catch(error =>{
        console.log('Could not get posts');
    });
    // i can decide to add a catch fxn to get the error
});

// Route that get the users post
router.get('/my-posts', (req, res)=>{
    Post.find({user: req.user.id}).populate('category')
        .then(posts=>{
            res.render('admin/posts/my-posts', {posts: posts});
        });
});

// render the create post page
router.get('/create', (req, res)=> {
    Category.find({}).then(categories=>{
        res.render('admin/posts/create', {categories: categories});
    });
});

// render the create post page
router.post('/store', (req, res)=> {
    let errors = [];

    if(!req.body.title){
        errors.push({message: 'please add a title'});
    }

    if(!req.body.status){
        errors.push({message: 'please add a status'});
    }

    if(!req.body.description){
        errors.push({message: 'please add a description'});
    }

    if(errors.length > 0){
        res.render('admin/posts/create', {
            errors: errors
        });
    } else {
        let file = req.files.file;
        let filename = Date.now() + '-' + file.name; //file.name;
        if(!isEmpty(req.files)){
            // let file = req.files.file;
            // let filename = Date.now() + '-' + file.name; //file.name;
            file.mv('./public/uploads/' + filename, (err)=>{
                if(err) throw err;
            });
        }

        let allowComments = true;
        if(req.body.allowComments){
            allowComments = true;
        } else {
            allowComments = false;
        }

        const newPost = new Post({
            user: req.user.id,
            title: req.body.title,
            status: req.body.status,
            allowComments: allowComments,
            body: req.body.description,
            category: req.body.category,
            file: filename
        });

        newPost.save().then(savedPost =>{
            req.flash('success_message', `Post was created successfully`);
            res.redirect('/admin/posts');
        }).catch(validator =>{
            res.render('admin/posts/create', {errors: validator.errors});
        });
    }
});


// render the edit post page
router.get('/edit/:id', (req, res)=> {
    //res.send(req.params.id);
    Post.findOne({_id: req.params.id}).then(post=>{
        Category.find({}).then(categories=>{
            res.render('admin/posts/edit', {post: post, categories: categories});
        });
    });
});

// this is the update route
router.put('/update/:id', (req, res)=> {
    //res.send('I am being updated');
    Post.findOne({_id: req.params.id}).then(post=>{
        if(req.body.allowComments){
            allowComments = true;
        } else {
            allowComments = false;
        }

        post.user          = req.user.id;
        post.title         = req.body.title;
        post.status        = req.body.status;
        post.allowComments = allowComments;
        post.description   = req.body.description;
        post.category      = req.body.category;

        if(!isEmpty(req.files)){
            let file = req.files.file;
            filename = Date.now() + '-' + file.name; //file.name;
            post.file = filename;

            file.mv('./public/uploads/' + filename, (err)=>{
                if(err) throw err;
            });
        }

        post.save().then(updatedPost=>{
            req.flash('success_message', 'Post was successfully updated');
            res.redirect('/admin/posts/my-posts');
        });

    });
});


// this route deletes post
router.delete('/:id', (req, res)=>{
    // Post.remove({_id: req.params.id})
    //     .then(result=>{
    //         req.flash('success_message', 'Post was successfully dalated');
    //         res.redirect('/admin/posts');
    //     });

    Post.findOne({_id: req.params.id})
        .populate('comments')
        .then(post=>{
            // fs to unlink file tp enable deletion
            fs.unlink(uploadDir + post.file, (err)=>{
                if(!post.comments.length < 1){
                    post.comments.forEach(comment=>{
                        comment.remove();
                    });
                }
                post.remove().then(postRemoved=>{
                    req.flash('success_message', 'Post was successfully deleted');
                    res.redirect('/admin/posts/my-posts');
                });
            });
        });
}); 

module.exports = router;