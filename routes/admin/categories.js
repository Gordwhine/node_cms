const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');
const { userAuthenticated } = require('../../helpers/authentication');

// Once app gets to this router, replace the layout with this 
router.all('/*', userAuthenticated, (req, res, next)=> {
    req.app.locals.layout = 'admin';
    next();
});

// this routes gets all categories
router.get('/', (req, res) => {
    Category.find({}).then(categories=>{
         res.render('admin/categories/index', {categories: categories});
    });
});

// this routes create a new category
router.post('/create', (req, res) => {
    // create a new object category
    const newCategory = Category({
        name: req.body.category
    });

    newCategory.save().then(savedCategory=>{
        req.flash('success_message', 'Category was created successfully');
        res.redirect('/admin/categories');
    });
});

// render the edit Category page
router.get('/edit/:id', (req, res)=> {
    //res.send(req.params.id);
    Category.findOne({_id: req.params.id}).then(category=>{
        res.render('admin/categories/edit', {category: category});
    });
});

// this is the update route
router.put('/update/:id', (req, res)=> {
    //res.send('I am being updated');
    Category.findOne({_id: req.params.id}).then(category=>{
        
        category.name = req.body.category;

        category.save().then(updatedCategory=>{
            req.flash('success_message', 'Category was successfully updated');
            res.redirect('/admin/categories');
        });

    });
});

// this route deletes post
router.delete('/:id', (req, res)=>{
    // Category.findOne({_id: req.params.id})
    //     .then(category=>{
    //     category.remove();
    //         req.flash('success_message', 'Category was successfully deleted');
    //         res.redirect('/admin/categories');
    // });
    Category.remove({_id: req.params.id}).then(result=>{
        req.flash('success_message', 'Category was successfully deleted');
        res.redirect('/admin/categories');
    });
}); 
module.exports = router;