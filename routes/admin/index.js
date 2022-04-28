const express = require('express');
const router = express.Router();
const { faker } = require('@faker-js/faker');
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const Comment = require('../../models/Comment');
const { userAuthenticated } = require('../../helpers/authentication');

// Once app gets to this router, replace the layout with this 
router.all('/*', userAuthenticated, (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
});

// Route that display the dashboard
router.get('/', (req, res) => {
    // long method
    // Post.count({}).then(postCount=>{
    //     Category.count({}).then(categoryCount=>{
    //         Comment.count({}).then(commentCount=>{
    //             res.render('admin/index', {
    //                 postCount: postCount, 
    //                 categoryCount: categoryCount,
    //                 commentCount: commentCount
    //             });
    //         });
    //     });
    // });

    // shorter method
    const promise = [
        Post.count().exec(),
        Category.count().exec(),
        Comment.count().exec()
    ];

    Promise.all(promise).then(([
        postCount, categoryCount, commentCount])=>{
            res.render('admin/index', {
                postCount: postCount,
                categoryCount: categoryCount,
                commentCount: commentCount
            });
    });
});

// this route generate fake datas
router.post('/generate-fake-posts', (req, res)=> {
    for(let i=0; i < req.body.amount; i++){
        let post = new Post();
        post.user  = req.user.id;
        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.random.boolean();
        post.description = faker.lorem.sentence();
        post.slug = faker.name.title();

        post.save(function(err){
            if(err) throw err;
        });
    }
    res.redirect('/admin/posts');
});


router.get('/dashboard', (req, res) => {
    res.render('admin/dashboard');
});

module.exports = router;