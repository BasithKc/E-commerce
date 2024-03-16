//Third party modules
require('dotenv').config()
const bcrypt = require('bcrypt')

//utilities
const { sendOtp, checkOtp } = require('../utilities/otp');

//Importing models
const Users = require('../model/users')
const Products = require('../model/product')
const Banners = require('../model/banner')
const Cart = require('../model/cart')


//ObjectID
const { ObjectId } = require('mongodb');


module.exports = {
    //Render login page
    getLogin: async (req, res) => {
        if (req.session.userId) {
            try {
                //Userid
                const userId = new ObjectId(req.session.userId)

                //fetching hoodies from database using lookup
                const hoodies = await Products.aggregate([
                    {
                        $match: {
                            sub_category: 'Hoodie'
                        }
                    },

                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'categoryId',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },

                    {
                        $match: {
                            $or: [
                                { 'category.name': 'Mens' },
                                { 'category.name': 'Womens' }
                            ]
                        }
                    },

                ])

                //Fetching 3 products to be desplayed on must have section 2 t-shirt and 1 hoodie
                //Fetch 1 T-shirt
                const tshirt = await Products.findOne({ sub_category: "T-Shirt" }).limit(1)

                //Fetch 1 hoodie
                const hoodie = await Products.findOne({ sub_category: 'Hoodie' }).limit(1)

                //Fetch 1 more T-shirt
                const secondTshirt = await Products.findOne({ sub_category: "T-Shirt" }).skip(1).limit(1)

                // Combine the results In the order of t-shirt - hoodie - t-shirt
                const mustHaveProducts = [tshirt, hoodie, secondTshirt];


                //Fetching first set of T-shirt for T-shirt section
                const firsttShirts = await Products.find({ sub_category: 'T-Shirt' }).skip(2).limit(4)

                //Fetching Hoodies for second hoodie section after skipping 1
                const firstHoodies = await Products.find({ sub_category: 'Hoodie' }).skip(1).limit(4)

                //Fetching second set of T-shirt
                const secondtShirts = await Products.find({ sub_category: 'T-Shirt' }).skip(6).limit(4)

                //Fetching Trending products using lookup
                const trendingProduct = await Products.aggregate([
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'categoryId',
                            foreignField: '_id',
                            as: 'category'
                        }
                    },

                    {
                        $match: {
                            'category.name': 'Trending'
                        }
                    }
                ])
                //Bringing Banners 
                const banners = await Banners.find({})



                //Cart products Bringing
                const carts = await Cart.findOne({ userId })

                if (carts) {
                    const productIds = carts.products.map(product => product.productId)//Extracting the product id in an array

                    // Fetching products based on productIds
                    const cartProducts = await Products.find({ _id: { $in: productIds } })

                    // Creating a map to quickly look up products by their ID
                    const productMap = new Map(cartProducts.map(product => [(product._id).toString(), product]))

                    //Now populate the cart with product details
                    var populatedCarts = [];
                    carts.products.forEach(product => {
                        populatedCarts.push({
                            product: productMap.get((product.productId).toString()),
                            quantity: product.quantity
                        });

                    });

                    var totalPrice = 0;
                    populatedCarts.forEach(cart => {

                        totalPrice += Number(cart.product.price) * Number(cart.quantity);
                    })
                }



                //rendering user's home page along with banners and products to display
                res.render('user/html/index', { hoodies, banners, mustHaveProducts, firsttShirts, firstHoodies, secondtShirts, trendingProduct, carts: populatedCarts, totalPrice })
            } catch (error) {
                //If any error occurs on asyncronous operation collect it
                console.log(error)
                res.status(500).send({ message: 'Server Error', error })
            }
        }
        const errorMessage = req.flash('error')
        const message = req.flash('message')
        res.render('login', { errorMessage, message });
    },

    //Post login page
    postLogin: async (req, res) => {

        //Collect datas from req.body
        const { email, password, number } = req.body
        try {
            //Fetch user Details
            const user = await Users.findOne({ $or: [{ email }, { number }] })
            if (!user) {
                req.flash('error', 'User does not exist')
                return res.redirect('/')
            }
            //Checking if the user is suspended or not
            if (user.isSuspend && user.suspensionEndTime > new Date()) {
                return res.status(403).send('Your account is suspended.');//in case of suspend
            }

            //calling isCorrectPassword method to check password of user schema
            const correctPassword = user.isCorrectPassword(password)

            //if not user or not correct password
            if (!user || !correctPassword) {
                req.flash('error', 'Invalid username or password')
                return res.redirect('/')
            } else {
                if (!user.otp) {
                    req.session.data = user
                    req.flash("message", "Looks like you haven't verified yet, Please verify")
                    return res.redirect('/send-otp')
                }

                //Checking whether the role is user 
                if (user.role === 'user') {

                    //If user redirect to userhome page and storing userId in session
                    req.session.userId = user._id
                    res.redirect('/userhome')

                } else {

                    //If not redirect to admin home page
                    req.session.adminId = user._id
                    res.redirect('/adminhome')
                }

            }
        } catch (err) {

            //Catch if any erro occurs
            console.log(err);
        }


    },

    //get signup page
    getSignup: (req, res) => {
        const errorMessage = req.query.error;//error messg
        res.render('signup', { errorMessage })
    },
    //get otp page aftter completing signup page
    otpPage: async (req, res) => {
        if (req.session.data) {
            const { number, channel } = req.session.data
            const verification = await sendOtp(number, channel)//funcion to send otp
            console.log(verification);
        }
        const message = req.query.message || req.flash('message')
        res.render('otp', { message })
    },

    //funcion to send  OTP forgotten password case
    forgottenGetOtp: async (req, res) => {
        const { to, channel } = req.body
        console.log(req.body);
        const numberExist = await Users.findOne({ number: to })
        if (!numberExist) {
            return res.json({ success: false, message: "Account is not registered " })
        }
        try {
            const verification = await sendOtp(to, channel) //send otp function

            console.log(verification);
            console.log('OTP sent successfully');
            req.session.otpData = {
                to: to,
                channel: channel,
            };
            res.json({ success: true });


        } catch (err) {
            console.log(err);
        }
    },

    //post otp in the case of forgotten
    forgottenPostOtp: async (req, res) => {
        console.log(req.body);
        const { otp } = req.body
        const { to } = req.session.otpData
        try {

            const verification = await checkOtp(to, otp) //function to verify otp
            console.log(verification);

            if (verification.status == "approved") {

                res.json({ success: true });

            } else {
                res.json({ success: false, message: "Invalid OTP" });
            }

        } catch (err) {
            console.log(err);
        }
    },

    //get reset password page after completing otp verification
    resetPasswordGet: (req, res) => {
        const error = req.flash('error')
        res.render("reset-password", { error })
    },
    //post reset password and update in database
    resetPasswordPost: async (req, res) => {
        const { password, confirmPassword } = req.body
        const { to } = req.session.otpData
        if (password !== confirmPassword) {
            req.flash('error', "Password do not match")
            return res.redirect('/reset-password')
        }
        const hashedPassword = await bcrypt.hash(password, 10)//hashing password using bcrypt
        const updation = await Users.findOneAndUpdate(
            { number: to },
            { password: hashedPassword },
            { new: true },
        )

        console.log(updation);
        req.flash('message', 'Password Updated Successfully')
        res.redirect('/')
    },

    getOtp: async (req, res) => {

        const { fname, lname, password, to, channel, email } = req.body //req.body

        //checking if number already exist  in the database or not using or operator
        const userExist = await Users.findOne({ $or: [{ number: to }, { email: to }] });

        if (userExist) {
            //if number already exist return  an error message
            return res.json({ success: false, message: "Account already Exist" })
        }

        try {

            const verification = await sendOtp(to, channel) //calling the function for sending otp
            console.log('OTP sent successfully');
            req.session.otpData = {
                to: to,
                channel: channel,
            };

            //new instance of user
            var newUser = new Users({
                firstName: fname,
                lastName: lname,
                password,
                email: isValidEmail(to) ? to : '',
                number: isValidEmail(to) ? '' : to,
                channel
            })

            function isValidEmail(email) {
                // Regular expression to validate email addresses
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }

            await newUser.save();

            req.session.userData = newUser
            res.json({ success: true });

        } catch (err) {
            console.log(err);
            res.json({ success: false });
        }
    },
    ResendOtp: async (req, res) => {
        try {
            console.log(req.session.otpData);
            const { to, channel } = req.session.otpData

            const verification = await sendOtp(to, channel)

            console.log('OTP sent successfully');
            const message = 'OTP sent successfully'
            res.render('otp', { message: message || '' })

        } catch (err) {
            console.log(err);

            res.json({ success: false });
        }
    },
    postOtp: async (req, res) => {

        const { otp } = req.body
        const { to, channel } = req.session.otpData
        try {

            const verification = await checkOtp(to, otp, channel)

            //if verification is approved change the field of otp to true , otherwise it will be false for future understanding
            if (verification.status == "approved") {
                await Users.findByIdAndUpdate(req.session.userData._id, { otp: true })
                req.session.destroy()
                res.json({ success: true });

            } else {
                res.json({ success: false, message: "Invalid OTP" });
            }

        } catch (err) {
            console.log(err);
        }
    }

}