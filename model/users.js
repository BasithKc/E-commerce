const mongoose = require('mongoose')
const bcrypt= require('bcrypt')

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:[true,'Please provide your First Name']
    },
    lastName:{
        type: String,
        required: [true, 'Please provide your Last Name']
    },
    email: {
        type: String,    
        lowercase: true,
        required: [true, "Please provide your Email"],
    },
    number:{
        type:String
    },
    password: {
        type: String,
        minlength:8,
        required: [true, "Please provide a Password"]
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    role:{
        type:String,
        default:'user'
    }

})
// Custom method to compare and validate passwords
userSchema.methods.isCorrectPassword=function(password){
    return bcrypt.compareSync(password, this.password)
}
// Hashing the password using bcrypt before saving it in database
userSchema.pre("save", function (next) {
    var user = this;
    if (!user.isModified("password")){
        return next();
        }
        bcrypt.genSalt(10, function(err, salt) {
                if (err) return next(err);
                bcrypt.hash(user.password ,salt , function(err, hash) {
                    if (err) return next(err);
                    // Store hash in your password field
                    user.password = hash;
                    console.log('User Password is '+user.password)
                    next();
                    });
                })
    });
    module.exports=mongoose.model("User", userSchema);

