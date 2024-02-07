const Products  = require('../model/product')
const Categories  = require('../model/category')
const Users = require('../model/users')
const Banners = require('../model/banner')
const {ObjectId}= require('mongodb')
const bcrypt = require('bcrypt')

module.exports = {
    getAdminHome: (req, res) => {
        res.render('admin/adminhome', { URL: 'dashboard' })
    },
    adminLogout:(req, res) => {
        req.session.destroy();
        res.redirect('/');
    },
    adminProduct:async (req, res) => { 
        const products = await  Products.find({})
        const categories = await Categories.find({})
        const message = req.flash('message') || ''
        res.render('admin/product', { URL: 'products',message,products,categories});
    },
    adminUserList:async (req,res) => {
        const message = req.flash('message')
        const users = await Users.find({})    
        res.render('admin/usersPage',{URL:'users',users,message})

    },
    adminUserListEditPage:async (req ,res) => {
        const userId = new ObjectId(req.params.userId)
        const user  = await Users.findOne({_id:userId})
        res.render('admin/users-edit', {userData:user,URL: 'users'})
    },
    adminUserDelete:async (req, res) => {
        const userId = new ObjectId(req.params.userId)
        const deleteUser = await Users.findByIdAndDelete(userId)
    },
    adminUserBlockpost:async (req,res) => {
        const userId = new ObjectId(req.params.userId)
        const {blockTime} = req.body
        suspensionEndTime = new Date(Date.now() + blockTime * 3600 * 1000);
        const user = await Users.findByIdAndUpdate(
            userId,
            {
                $set: {
                    isSuspend: true,
                    suspensionEndTime: suspensionEndTime
                }
            },
            { upsert: true }
        )

        req.flash('message', 'Account Blocked')
        res.redirect('/admin/users')
    },
    adminUserUnblockPost: async (req, res) => {
        const { userId } = req.params;

        const user = await Users.findByIdAndUpdate(userId, {
            $set: {
                isSuspend: false, 
                suspensionEndTime:null
            }
        });
    
        req.flash('message', 'Account Unblocked')
        res.redirect('/admin/users')
    },
    adminAddProductGet:(req, res) => {
        const message = req.flash('message')
        res.render('admin/addproduct', { URL: 'products', message });
    },
    adminAddProductPost:async (req, res) => {
        const {name, price,  description,  category, sub_category,  expire_date, stock,specifications} = req.body
        var nowDate = new Date(expire_date); 
        var date = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate(); 
        const categoryCheck = await Categories.findOne({name:category});
        const files = req.files
        const imagePaths = files.map(file => file.filename); 
        const newProduct = new  Products({
             name,
             price:`${price}`, 
             description,
             specifications:[],
             categoryId: categoryCheck._id,
             sub_category,
             expire_date:date,
             stock,
             image:imagePaths
        })
        try{
            specifications.forEach(spec => {
                newProduct.specifications.push(spec);
              });

            await newProduct.save()
            console.log('product saved');
            req.flash('message', 'Product Added Seccessfully')
            return res.redirect('/admin/products')
        } catch(err) {
            console.log(err);
        }
    },
    adminAccount:async (req, res) => {
        let message = req.query.message
        message1 = req.flash('message')
        console.log(message1);
        const admin = await Users.findOne({_id:req.session.adminId})
        res.render('admin/account', { URL: 'accounts' , adminData:admin,message, message1});
    },
    adminAccountUpdate:async (req, res) =>{
        try {
                const userId =new ObjectId(req.params.userId)
                const {firstName, lastName, email, number } = req.body
                const avatar = req.file.filename
                const user = await Users.findByIdAndUpdate(userId,
                {
                   $set: {
                        firstName,
                        lastName,
                        email,
                        number,
                        profile:avatar
                    }
                },
                { new: true } 
                )
                console.log(user);
                if (!user) {
                    return res.status(404).json({ success: false, message: 'User not found' });
                }
                res.json({ success: true, message: 'User profile updated successfully', user });
            } catch (error) {
                console.error('Error updating user profile:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
    },
    adminDeleteAccount: async (req,res) => {
        const userId = new ObjectId( req.params.userId)
        const deleteAcc  = await Users.findOneAndDelete(userId)
    },
    adminResetPasswordGet:(req, res) => {
        const error = req.flash('error')
        res.render('admin/admin-reset-password',{error, URL: 'accounts'})
    },
    adminResetPasswordPost: async (req, res) => {
        const adminId = req.session.adminId
        const {oldPassword, password} = req.body
        const admin = await Users.findOne({_id:adminId})
        
        const correctPassword = admin.isCorrectPassword(oldPassword)
        if(!correctPassword){
            req.flash('error', 'previous password do not match')
            return res.redirect('/admin/accounts/reset-password')
        }
        try {
            const hashedPassword =await bcrypt.hash(password,10)
            const updatedAdmin = await Users.findByIdAndUpdate(adminId,
               {
                  $set: {
                    password:hashedPassword
                  } 
               },
               { new: true }
            )
            req.flash('message', 'Password updated Successfully')
            res.redirect('/admin/accounts')
        } catch (error) {
            console.log(error);
            res.status(500).json({'Error':'Connot reset Password right now'})
        }
    },
    adminAddCategory:async (req,res)=> {
        const {name, description, sub_category} = req.body
        console.log(req.body);
        const isCategoryExist = await Categories.findOne({name})
        if(!isCategoryExist){
            const category = new Categories({
                name,
                sub_category,
                description
            })
            await category.save()
        } else {
            await Categories.findOneAndUpdate(
                {name},
                {$addToSet:{sub_category}},
                {new:true, upsert:true}
            )
        }
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
        console.log('hello')
        const categories = await Categories.find({})

        const categoryName = await Products.aggregate([
            {
                 $match : {_id:productId}
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
        console.log(categoryName[0].category[0].name);
        if (categoryName.length > 0) {
            res.render('admin/edit-product',{URL: 'products',product,categoryName:categoryName[0],categories})
            } else {
            console.log("No profile found for the specified user ID.");
        }
    },
    editProductPost:async (req, res) => {
        const productId =new ObjectId(req.params.productId)
        const {name, price, description,  category, expire_date, stock,specifications} = req.body
        console.log(specifications)
        var nowDate = new Date(expire_date); 
        var date = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();         

        const categoryCheck = await Categories.findOne({name:category});
        const files = req.files
        const imagePaths = files.map(file => file.filename); 
        if(req.files.length > 0 ){

                const product = await Products.findOneAndUpdate(productId,
                    {
                        name,
                        description,
                        price:`${price}`,
                        specifications,
                        categoryId:categoryCheck._id,
                        expire_date:date,
                        stock,
                        image:imagePaths
                    },
                    { new: true }
                )
            
        }else {
             const product = await Products.findOneAndUpdate(productId,
                {
                    name,
                    description,
                    price:`${price}`,
                    specifications,
                    categoryId:categoryCheck._id,
                    expire_date:date,
                    stock,
                },
                { new: true }
            )
        }
        req.flash('message', `Product ${name} Edited Successfully`)
        res.redirect('/admin/products')
    },
    adminBannerGet:(req,res) => {
        const message = req.flash('message')
        res.render("admin/admin-banners",{URL:'banners',message})
    },
    adminBannerPost: async (req, res) => {
        const {bannerHead,charecterist,description,expire_date} = req.body
        console.log(description)
        const file = req.file.filename
        console.log(file)
        var nowDate = new Date(expire_date); 
        var date = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();

        const newBanner = new Banners({
            bannerHead,
            charecterist,
            description,
            expire_date:date,
            image:file
        })
        await newBanner.save()
        req.flash('message', 'Banner Added')
        res.redirect('/admin/banners')
    }

}