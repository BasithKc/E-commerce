module.exports = {
    getLogin: (req,res) => {
        res.render('login');
    },
    getSignup: (req, res) => {
        res.render('signup')
    },
    getOtp:(req,res) => {
        res.render('otp')
    },
    postSignup: (req, res) => {
        res.redirect('/signup/otp')
    }

}