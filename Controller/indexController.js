const Users = require('../model/users')
require('dotenv').config()
const bcrypt = require('bcrypt')
const { sendOtp, checkOtp } = require('../utilities/otp');




module.exports = {
    //Render login page
    getLogin: (req, res) => {
        const errorMessage = req.flash('error')
        const message = req.flash('message')
        res.render('login', { errorMessage, message });
    },

    //Post login page
    postLogin: async (req, res) => {

        //Collect datas from req.body
        const { email, password } = req.body
        try {
            //Fetch user Details
            const user = await Users.findOne({ email })

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

    getSignup: (req, res) => {
        const errorMessage = req.query.error;
        res.render('signup', { errorMessage })
    },
    otpPage: async (req, res) => {
        if (req.session.data) {
            const { number, channel } = req.session.data
            const verification = await sendOtp(number, channel)
            console.log(verification);
        }
        const message = req.query.message || req.flash('message')
        res.render('otp', { message })
    },
    forgottenGetOtp: async (req, res) => {
        const { to, channel } = req.body
        console.log(req.body);
        const numberExist = await Users.findOne({ number: to })
        if (!numberExist) {
            return res.json({ success: false, message: "Number is not registered " })
        }
        try {
            const verification = await sendOtp(to, channel)

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
    forgottenPostOtp: async (req, res) => {
        console.log(req.body);
        const { otp } = req.body
        const { to } = req.session.otpData
        try {

            const verification = await checkOtp(to, otp)
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
    resetPasswordGet: (req, res) => {
        const error = req.flash('error')
        res.render("reset-password", { error })
    },
    resetPasswordPost: async (req, res) => {
        const { password, confirmPassword } = req.body
        const { to } = req.session.otpData
        if (password !== confirmPassword) {
            req.flash('error', "Password do not match")
            return res.redirect('/reset-password')
        }
        const hashedPassword = await bcrypt.hash(password, 10)
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