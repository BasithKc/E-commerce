//importing models
const Products = require('../model/product');
const Categories = require('../model/category');
const Users = require('../model/users');
const Banners = require('../model/banner');
const Coupons = require('../model/coupon');
const Orders = require('../model/order')
const Addresses = require('../model/address')

//coupon Generator
const couponGenerator = require('../middlewares/coupongenerator')

//Objectid
const { ObjectId } = require('mongodb');

//third party module
const bcrypt = require('bcrypt');

module.exports = {
    //admin dashboard
    getAdminHome: async (req, res) => {
        // Fetch signed-up user data from MongoDB
        const userData = await Users.find({});

        //order data for graph
        const orderData = await Orders.aggregate([
            // Unwind the orders array to denormalize
            { $unwind: "$orders" },
            // Lookup product details for each order
            {
                $lookup: {
                    from: "products",
                    localField: "orders.product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            // Unwind the product array
            { $unwind: "$product" },
            //Lookup category details for each product
            {
                $lookup: {
                    from: 'categories',
                    localField: 'product.categoryId',
                    foreignField: '_id',
                    as: 'category'
                }
            },

            {
                // Group by category and count orders
                $group: {
                    _id: {
                        category: "$category.name",
                    },
                    orderCount: { $sum: 1 }
                }
            },
            // Project to rename _id to category and sort by order count
            {
                $project: {
                    category: "$_id.category",
                    orderCount: 1,
                    _id: 0
                }
            },
            { $sort: { orderCount: -1 } }
        ]);

        //color of orders
        const colorData = await Orders.aggregate([
            // Unwind the orders array to denormalize
            { $unwind: "$orders" },
            // Lookup product details for each order
            {
                $lookup: {
                    from: "products",
                    localField: "orders.product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            // Unwind the product array
            { $unwind: "$product" },
            //Lookup category details for each product

            {
                // Group by category and count orders
                $group: {
                    _id: {
                        color: "$product.color",
                    },
                    orderCount: { $sum: 1 }
                }
            },
            // Project to rename _id to category and sort by order count
            {
                $project: {
                    color: "$_id.color",
                    orderCount: 1,
                    _id: 0
                }
            },
            { $sort: { orderCount: -1 } }
        ]);

        // signup data for graph
        const UserSinupData = formatDataForGraph(userData);
        const data = UserSinupData.data
        console.log([...data])

        res.render('admin/adminhome', { URL: 'dashboard', graphDataUser: UserSinupData, categoryData: orderData, colorData });
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

        try {
            const productId = new ObjectId(req.params.productId);
            const product = await Products.findOne({ _id: productId });//fetching the product by the provided id

            const categories = await Categories.find({}); //fetching whole categories to list in category list of the product

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
        } catch (error) {
            console.log(error)
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
            //if data do not exist in file input
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

    //banner page rendering with all the banners from  database
    adminBannerGet: async (req, res) => {
        const banner = await Banners.find({});//fetching all banners from the database

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
        const bannerId = new ObjectId(req.params.bannerId);//banner id from req.params

        const deletedBanner = await Banners.findByIdAndDelete(bannerId); //delete the banner from database by the id

        req.flash('message', 'Banner Deleted');//flash message
        res.redirect('/admin/banners');
    },

    //Banner Edit page rendering
    adminBannerEdit: async (req, res) => {
        const bannerId = new ObjectId(req.params.bannerId); //bannerId from req.params

        const banner = await Banners.findById(bannerId);//fetching  the banner by Id
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

    //list orders
    adminOrders: async (req, res) => {

        //Fetching  Order details
        const totalOrders = await Orders.find({})

        res.render('admin/order-page', { URL: 'orders', totalOrders });
    },

    //render the details page of clicked order
    orderEditPage: async (req, res) => {
        const orderId = new ObjectId(req.params.orderId) //order id from params
        try {
            //checking if already any order  for this id
            const orderDetails = await Orders.findOne(
                { "orders._id": orderId },// Match the document containing the desired order
                { "orders.$": 1, userId: 1 } // Project only the matched order
            ).populate({ path: "orders.product", model: 'products' })

            //address
            const addressDetails = await Addresses.findOne(
                { "addresses._id": orderDetails.orders[0].addressId },
                { "addresses.$": 1 }
            )

            res.render('admin/order-details', { address: addressDetails, orderPro: orderDetails.orders[0] })
        } catch (error) {
            console.log(error)
        }

    },

    orderEditStatus: async (req, res) => {
        const status = req.query.status //extract status from req.query
        console.log(status)
        const orderId = new ObjectId(req.params.orderId)

        try {
            //change the status from database
            await Orders.findOneAndUpdate(
                { "orders._id": orderId },
                {
                    $set: {
                        "orders.$.status": status,// Set the new status for the matched document
                        "orders.$.shippedDate": date.now()
                    }
                },
                { new: true }
            )

            res.redirect('/admin/order/edit-order/' + orderId)
        } catch (error) {
            console.log(error)
        }


    },

    //Function for coupon page rendering
    adminCouponPage: async (req, res) => {

        const couponCode = couponGenerator()//coupon code generated by couponGenerator function

        //pagination
        const page = req.query.page || 1
        const limit = 5
        const skip = (page - 1) * limit

        const message = req.flash('message');
        const coupons = await Coupons.find({})
            .skip(skip) // Skip the specified number of documents
            .limit(limit); // Limit the number of documents returned

        res.render('admin/coupon-page', { URL: 'coupons', message, coupons, couponCode });
    },

    //function to add coupon by admin
    addCoupon: async (req, res) => {
        //extracting datas from req.body
        let { coupon_code, minOrderAmount, discount, start_date, expire_date } = req.body

        try {
            //creating an instance of coupon
            const coupon = new Coupons({
                coupon_code,
                minOrderAmount,
                discount,
                start_date,
                expire_date
            })
            await coupon.save()

            req.flash('message', 'Coupon Added succesfully')//sending message in flash
            res.redirect('/admin/coupons')
        } catch (error) {
            //catch any error
            console.log(error)
        }

    },

    //function to edit coupon
    adminCouponEdit: async (req, res) => {
        const couponId = new ObjectId(req.params.couponId)//couponid from req.params

        try {

            //fetch the coupon from db using the couponid
            const coupon = await Coupons.findById(couponId)

            //render the page with the coupon details
            res.render('admin/coupon-edit', { coupon })
        } catch (error) {
            console.log(error)
        }

    },

    adminCouponEditPost: async (req, res) => {
        const couponId = new ObjectId(req.params.couponId)

        //extracting the values from req.body
        let { minOrderAmount, discount, start_date, expire_date } = req.body

        try {
            //find one and update the edits in database
            await Coupons.findOneAndUpdate(
                { _id: couponId },
                {
                    $set: {
                        minOrderAmount,
                        discount,
                        start_date,
                        expire_date
                    }
                }
            )
            req.flash('message', 'Coupon Edited Successfully')
            return res.redirect('/admin/coupons')
        } catch (error) {
            console.log(error)
        }

    },

    //Function to delete coupon  from the database
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