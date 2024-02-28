//importing models
const Products = require('../model/product');
const Categories = require('../model/category');
const Users = require('../model/users');
const Banners = require('../model/banner');
const Coupons = require('../model/coupon');
const Orders = require('../model/order')

//Objectid
const { ObjectId } = require('mongodb');

//third party module
const bcrypt = require('bcrypt');

module.exports = {
    //admin dashboard
    getAdminHome: async (req, res) => {
        // Fetch signed-up user data from MongoDB
        const userData = await Users.find({});

        // Format data for graph
        const formattedData = formatDataForGraph(userData);
        console.log(formattedData)

        res.render('admin/adminhome', { URL: 'dashboard', graphData: formattedData });
    },

    //Admin logout function
    adminLogout: (req, res) => {
        req.session.destroy();
        res.redirect('/');
    },

    //Admin product page rendering
    adminProduct: async (req, res) => {
        const products = await Products.find({}); //fetch product  list from db

        const categories = await Categories.find({});//fetch category list from db

        const message = req.flash('message') || ''; //accepting flash message

        res.render('admin/product', {
            URL: 'products',
            message,
            products,
            categories,
        });
    },

    //Admin list of users page rendering
    adminUserList: async (req, res) => {
        const message = req.flash('message');
        const users = await Users.find({});//get all the registered users in database

        res.render('admin/usersPage', {
            URL: 'users',
            users,
            message
        });
    },

    //Admin edit and seee of users details function
    adminUserListEditPage: async (req, res) => {
        const userId = new ObjectId(req.params.userId); //req params 

        const user = await Users.findOne({ _id: userId }); // find the user using the userId

        res.render('admin/users-edit', { userData: user, URL: 'users' });
    },

    //user deleting by admin
    adminUserDelete: async (req, res) => {
        const userId = new ObjectId(req.params.userId);
        const deleteUser = await Users.findByIdAndDelete(userId);//find by id and delete the whole document
    },

    adminUserBlockpost: async (req, res) => {
        const userId = new ObjectId(req.params.userId);
        const { blockTime } = req.body;
        suspensionEndTime = new Date(Date.now() + blockTime * 3600 * 1000);
        const user = await Users.findByIdAndUpdate(
            userId,
            {
                $set: {
                    isSuspend: true,
                    suspensionEndTime: suspensionEndTime,
                },
            },
            { upsert: true }
        );

        req.flash('message', 'Account Blocked');
        res.redirect('/admin/users');
    },

    adminUserUnblockPost: async (req, res) => {
        const { userId } = req.params;

        const user = await Users.findByIdAndUpdate(userId, {
            $set: {
                isSuspend: false,
                suspensionEndTime: null,
            },
        });

        req.flash('message', 'Account Unblocked');
        res.redirect('/admin/users');
    },

    adminAddProductGet: (req, res) => {
        const message = req.flash('message');
        res.render('admin/addproduct', { URL: 'products', message });
    },

    adminAddProductPost: async (req, res) => {

        //Destrucring the data from formbdody
        const {
            name,
            price,
            description,
            category,
            sub_category,
            expire_date,
            stock,
            specifications,
            color,
            selectSize
        } = req.body;

        //Converting the stringed date to Date object
        var nowDate = new Date(expire_date);

        //Finding only year, month and date format
        var date =
            nowDate.getFullYear() +
            '/' +
            (nowDate.getMonth() + 1) +
            '/' +
            nowDate.getDate();

        //Checking for the category  
        const categoryCheck = await Categories.findOne({ name: category });

        //Destructring req.files for product image
        const files = req.files;

        //Selecting only filename
        const imagePaths = files.map((file) => file.filename);

        try {
            //Adding to database
            const newProduct = new Products({
                name,
                price: `${price}`,
                description,
                specifications: [],
                categoryId: categoryCheck._id,
                sub_category,
                expire_date: date,
                stock,
                image: imagePaths,
                color,
                size: selectSize
            });

            //Pushing the array of specification to specification field of doc
            specifications.forEach((spec) => {
                newProduct.specifications.push(spec);
            });

            //Save the newProduct
            await newProduct.save();

            //Redirecting along with the flash message
            req.flash('message', 'Product Added Seccessfully');
            return res.redirect('/admin/products');
        } catch (err) {
            //Catching errors during the add process
            console.log(err);
        }
    },

    adminAccount: async (req, res) => {
        let message = req.query.message;
        message1 = req.flash('message');
        console.log(message1);
        const admin = await Users.findOne({ _id: req.session.adminId });
        res.render('admin/account', {
            URL: 'accounts',
            adminData: admin,
            message,
            message1,
        });
    },

    adminAccountUpdate: async (req, res) => {
        try {
            const userId = new ObjectId(req.params.userId);
            const { firstName, lastName, email, number } = req.body;
            const avatar = req.file.filename;
            const user = await Users.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        firstName,
                        lastName,
                        email,
                        number,
                        profile: avatar,
                    },
                },
                { new: true }
            );
            console.log(user);
            if (!user) {
                return res
                    .status(404)
                    .json({ success: false, message: 'User not found' });
            }
            res.json({
                success: true,
                message: 'User profile updated successfully',
                user,
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            res
                .status(500)
                .json({ success: false, message: 'Internal server error' });
        }
    },

    adminDeleteAccount: async (req, res) => {
        const userId = new ObjectId(req.params.userId);
        const deleteAcc = await Users.findOneAndDelete(userId);
    },

    adminResetPasswordGet: (req, res) => {
        const error = req.flash('error');
        res.render('admin/admin-reset-password', { error, URL: 'accounts' });
    },

    adminResetPasswordPost: async (req, res) => {
        const adminId = req.session.adminId;
        const { oldPassword, password } = req.body;
        const admin = await Users.findOne({ _id: adminId });

        const correctPassword = admin.isCorrectPassword(oldPassword);
        if (!correctPassword) {
            req.flash('error', 'previous password do not match');
            return res.redirect('/admin/accounts/reset-password');
        }
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const updatedAdmin = await Users.findByIdAndUpdate(
                adminId,
                {
                    $set: {
                        password: hashedPassword,
                    },
                },
                { new: true }
            );
            req.flash('message', 'Password updated Successfully');
            res.redirect('/admin/accounts');
        } catch (error) {
            console.log(error);
            res.status(500).json({ Error: 'Connot reset Password right now' });
        }
    },

    // Function to add category
    adminAddCategory: async (req, res) => {
        const { name, description, sub_category } = req.body;
        console.log(req.body);
        const isCategoryExist = await Categories.findOne({ name });
        if (!isCategoryExist) {
            const category = new Categories({
                name,
                sub_category,
                description,
            });
            await category.save();
        } else {
            await Categories.findOneAndUpdate(
                { name },
                { $addToSet: { sub_category } },
                { new: true, upsert: true }
            );
        }
        req.flash('message', 'Category added successfully');
        res.redirect('/admin/products');
    },

    adminEditCategoryGet: async (req, res) => {
        const categoryId = new ObjectId(req.params.categoryId);
        const category = await Categories.findOne({ _id: categoryId });
        res.render('admin/edit-category', { category, URL: 'products' });
    },

    adminEditCategoryPost: async (req, res) => {
        const categoryId = new ObjectId(req.params.categoryId);
        const { name, sub_category, description } = req.body;
        console.log(req.body);
        const category = await Categories.findOneAndUpdate(categoryId, {
            name,
            sub_category,
            description,
        });
        req.flash('message', 'Category Updated Successfully');
        res.redirect('/admin/products');
    },

    deletProduct: async (req, res) => {
        const productId = new ObjectId(req.params.productId);

        await Products.findByIdAndDelete(productId);
        req.flash('message', 'Product deleted successfully');
        res.redirect('/admin/products');
    },

    deleteCategory: async (req, res) => {
        const categoryId = new ObjectId(req.params.categoryId);

        await Categories.findByIdAndDelete(categoryId);
        req.flash('message', 'Category deleted successfully');
        res.redirect('/admin/products');
    },

    //render product details page and edit
    editProductGet: async (req, res) => {
        const productId = new ObjectId(req.params.productId);
        const product = await Products.findOne({ _id: productId });
        const categories = await Categories.find({});

        const categoryName = await Products.aggregate([
            {
                $match: { _id: productId },
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category',
                },
            },
        ]);
        if (categoryName.length > 0) {
            res.render('admin/edit-product', {
                URL: 'products',
                product,
                categoryName: categoryName[0],
                categories,
            });
        } else {
            console.log('No profile found for the specified user ID.');
        }
    },

    //function to edit product and update db
    editProductPost: async (req, res) => {

        //Converting product id to object id, to access product correctly
        const productId = new ObjectId(req.params.productId);

        //Destructuring form datas from req.body
        const {
            name,
            price,
            description,
            category,
            expire_date,
            stock,
            specifications,
            color,
            selectSize
        } = req.body;

        //Converting string date to Date object
        var nowDate = new Date(expire_date);

        //Taking only year, month and date to constant date
        var date =
            nowDate.getFullYear() +
            '/' +
            (nowDate.getMonth() + 1) +
            '/' +
            nowDate.getDate();

        //Checking whether category exist or not
        const categoryCheck = await Categories.findOne({ name: category });

        //Destructuring files from input file of product image
        const files = req.files;

        //mapping files and destructuring only filename which was created by multer, and assigning to imagePath as an array
        const imagePaths = files.map((file) => file.filename);

        //if data in file input exist
        if (req.files.length > 0) {
            const product = await Products.findOneAndUpdate(
                productId,
                {
                    name,
                    description,
                    price: `${price}`,
                    specifications,
                    categoryId: categoryCheck._id,
                    expire_date: date,
                    stock,
                    image: imagePaths,
                    color,
                    selectSize
                },
                { new: true }
            );
        } else {
            // data do not exist in input file
            const product = await Products.findOneAndUpdate(
                productId,
                {
                    name,
                    description,
                    price: `${price}`,
                    specifications,
                    categoryId: categoryCheck._id,
                    expire_date: date,
                    stock,
                    color,
                    size: selectSize
                },
                { new: true }
            );
        }
        //Sending confirmation message using flash
        req.flash('message', `Product ${name} Edited Successfully`);
        res.redirect('/admin/products');
    },

    adminBannerGet: async (req, res) => {
        const banner = await Banners.find({});
        const message = req.flash('message');
        res.render('admin/admin-banners', { URL: 'banners', message, banner });
    },

    //Banner creation
    adminBannerPost: async (req, res) => {

        //take data from req.body
        const { bannerHead, charecterist, description, expire_date } = req.body;

        //taking multer created filename from req.file
        const file = req.file.filename;

        //Converting string date to Date
        var nowDate = new Date(expire_date);

        //get only year, month and date
        var date =
            nowDate.getFullYear() +
            '/' +
            (nowDate.getMonth() + 1) +
            '/' +
            nowDate.getDate();

        //Create new instance of banner using above data
        const newBanner = new Banners({
            bannerHead,
            charecterist,
            description,
            expire_date: date,
            image: file,
        });
        await newBanner.save();//save
        req.flash('message', 'Banner Added'); //message passing in req.flash
        res.redirect('/admin/banners');
    },

    //Bannner Delete
    adminBannerDelete: async (req, res) => {
        const bannerId = new ObjectId(req.params.bannerId);
        const deletedBanner = await Banners.findByIdAndDelete(bannerId);
        req.flash('message', 'Banner Deleted');
        res.redirect('/admin/banners');
    },

    //Banner Edit page rendering
    adminBannerEdit: async (req, res) => {
        const bannerId = new ObjectId(req.params.bannerId);
        const banner = await Banners.findById(bannerId);
        console.log(banner);
        message = '';

        res.render('admin/edit-banner', { banner, URL: 'banners', message });
    },

    //Banner Editing 
    adminBannerEditPost: async (req, res) => {
        const bannerId = new ObjectId(req.params.bannerId);
        const { bannerHead, charecterist, description, expire_date } = req.body;
        console.log(description);
        if (req.files) {
            var file = req.files.filename;
        }

        if (file) {
            const updatedBanner = await Banners.findByIdAndUpdate(bannerId, {
                bannerHead,
                charecterist,
                description,
                expire_date,
                image: file,
            });
        } else {
            const updatedBanner = await Banners.findByIdAndUpdate(bannerId, {
                bannerHead,
                charecterist,
                description,
                expire_date,
            });
        }

        req.flash('message', 'Banner Updated');
        res.redirect('/admin/banners');
    },

    adminOrders: async (req, res) => {

        //Fetching  Order details
        const totalOrders = await Orders.find({})

        res.render('admin/order-page', { URL: 'orders', totalOrders });
    },

    adminCouponPage: async (req, res) => {
        // let newDiscountCode = new Coupons({
        //     code:myDiscountCode,
        //     isPercent: false,
        //     amount:100,
        //     expireDate:'23/03/2024',
        //     isActive:true
        // })
        // const response = await newDiscountCode.save()
        const message = req.flash('message');
        const coupons = await Coupons.find({});

        res.render('admin/coupon-page', { URL: 'coupons', message, coupons });
    },

    adminCouponEdit: async (req, res) => { },

    adminCouponDelete: async (req, res) => {
        const couponId = new ObjectId(req.params.couponId);
        const couponDelete = await Coupons.findByIdAndDelete(couponId);
        req.flash('message', 'Coupon Deleted');
        res.redirect('/admin/coupons');
    },
};

function formatDataForGraph(userData) {
    //Count signups by month
    let signupCountByMonth = {}

    var labels = []
    var data = []

    userData.forEach(user => {

        var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

        var singupMonth = months[user.dateCreated.getMonth()];

        let key = `${singupMonth} `; // Format: 'YYYY-MM'

        if (signupCountByMonth[key]) {
            signupCountByMonth[key]++
        } else {
            signupCountByMonth[key] = 1
        }


    })

    // Convert signupCountsByMonth object to arrays for Chart.js
    Object.keys(signupCountByMonth).forEach(key => {
        labels.push(key)
        data.push(signupCountByMonth[key])
    })
    // console.log(labels)

    return {
        label: labels,
        data: data
    }
}