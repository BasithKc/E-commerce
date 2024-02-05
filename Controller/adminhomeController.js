const Products  = require('../model/product')
const Categories  = require('../model/category')
const Users = require('../model/users')
const {ObjectId}= require('mongodb')

module.exports = {
    getAdminHome: (req, res) => {
        res.render('admin/adminhome', { URL: 'dashboard' })
    },
    adminLogout:(req, res) => {
        req.session.destroy();
        res.redirect('/');
    },
    adminProduct:async (req, res) => {
        const message2 = req.query.message
        const products = await  Products.find({})
        const categories = await Categories.find({})
        const message = req.flash('message') || ''
        res.render('admin/product', { URL: 'products',message,products,categories,message2});
    },
    adminUserList:async (req,res) => {
        const users = await Users.find({})    
        res.render('admin/usersPage',{URL:'users',users})

    },
    adminAddProductGet:(req, res) => {
        const message = req.flash('message')
        res.render('admin/addproduct', { URL: 'products', message });
    },
    adminAddProductPost:async (req, res) => {
        const {name, price,  description,  category, sub_category,  expire_date, stock} = req.body
        var nowDate = new Date(expire_date); 
        console.log(category,sub_category);
        var date = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate(); 

        const categoryCheck = await Categories.findOne({name:category, sub_category});

        const files = req.files
        const imagePaths = files.map(file => file.filename); 
        const product = new  Products({
             name,
             price:`$${price}`, 
             description,
             categoryId: categoryCheck._id,
             sub_category,
             expire_date:date,
             stock,
             image:imagePaths
        })
        try{
            await product.save()
            console.log('product saved');
            req.flash('message', 'Product Added Seccessfully')
            return res.redirect('/admin/products')
        } catch(err) {
            console.log(err);
        }
    },
    adminAccount:async (req, res) => {
        console.log(req.session.adminId);
        const admin = await Users.findOne({_id:req.session.adminId})
        console.log(admin);
        res.render('admin/account', { URL: 'accounts' , adminData:admin});
    },
    adminAccountUpdate:async (req, res) =>{
        const userId =new ObjectId(req.params.userId)
        const {firstName, lastName, email, number, avatar } = req.body
        const user = await Users.findOneAndUpdate(userId,
            {
                firstName,
                lastName,
                email,
                number,
                profile:avatar
            }
            )
            res.json({success:true}) 
    },
    adminAddCategory:async (req,res)=> {
        const {name, description, sub_category} = req.body
        console.log(req.body);
        const category = new Categories({
            name,
            sub_category,
            description
        })
        await category.save()
        req.flash('message', 'Category added successfully')
        res.redirect('/admin/products')
    },
    adminEditCategoryGet:async (req,res) => {
        const categoryId =new ObjectId(req.params.categoryId) 
        const category = await Categories.findOne({_id:categoryId})
        res.render('admin/edit-category',{category})
    },
    adminEditCategoryPost: async (req, res) => {
        const categoryId =new ObjectId(req.params.categoryId)
        const {name, sub_category, description} = req.body
        console.log(req.body); 
        const category = await Categories.findOneAndUpdate(categoryId,
            {
                name,
                sub_category,
                description
            }
        )
        req.flash('message', 'Category Updated Successfully')
        res.redirect('/admin/products')
    },
    deletProduct:async (req, res) => {
        const productId = new ObjectId(req.params.productId) 
        
        await Products.findByIdAndDelete(productId)
        req.flash('message' , 'Product deleted successfully')
        res.redirect('/admin/products',)
    },
    deleteCategory:async (req, res) => {
        const categoryId = new ObjectId(req.params.categoryId) 
        
        await Categories.findByIdAndDelete(categoryId)
        req.flash('message' , 'Category deleted successfully')
        res.redirect('/admin/products',)
    },
    editProductGet:async (req,res) => {
        const productId =new ObjectId(req.params.productId)
        const product = await Products.findOne({_id:productId})

        const categoryName = await Products.aggregate([
            {
                 $match : {categoryId : product.categoryId}
            },
            {
                $lookup: {
                    from: 'categories',
                    localField:'categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            }                     
        ]) 
        if (categoryName.length > 0) {
            } else {
            console.log("No profile found for the specified user ID.");
        }
        res.render('admin/edit-product',{URL: 'products',product:categoryName[0]})
    },
    editProductPost:async (req, res) => {
        const productId =new ObjectId(req.params.productId)
        const {name, price, description,  category, expire_date, stock} = req.body
        var nowDate = new Date(expire_date); 
        var date = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate(); 
        console.log(category);
        

        const categoryCheck = await Categories.findOne({name:category});
        const files = req.files
        const imagePaths = files.map(file => file.filename); 
        if(req.files.length > 0 ){

            const product = await Products.findOneAndUpdate(productId,
                {
                    name,
                    description,
                    price:`$${price}`,
                    categoryId:categoryCheck._id,
                    expire_date:date,
                    stock,
                    image:imagePaths
                }
            )
        }else {
             const product = await Products.findOneAndUpdate(productId,
                {
                    name,
                    description,
                    price:`$${price}`,
                    categoryId:categoryCheck._id,
                    expire_date:date,
                    stock,
                }
            )
        }
        req.flash('message', `Product ${name} Edited Successfully`)
        res.redirect('/admin/products')
    }

}