const Users = require('../model/users')
const twilio = require('twilio');
require('dotenv').config()
const {sendOtp, checkOtp} = require('../middlewares/otp');




module.exports = {
    getLogin: (req,res) => {
        const errorMessage = req.flash('error')
        res.render('login',{errorMessage});
    },
    postLogin:async (req, res) => {
        const {email, password} = req.body
        try{
            const user = await Users.findOne({email})
            console.log(user);

            const correctPassword = user.isCorrectPassword(password)

            console.log(user);
            if(!user || !correctPassword ){               
                req.flash('error','Invalid username or password')
                return res.redirect('/')
            }else {
                if(!user.otp){
                    req.session.data = user
                    req.flash("message", "Looks like you haven't verified yet, Please verify")
                    return res.redirect('/send-otp')
                }
                req.session.userId = user._id;
                console.log(req.session.userId);
                if(user.role === 'user'){
                    res.redirect('/userhome')
                }else {
                    res.redirect('/adminhome')
                }
                
            }
        } catch (err) {
            console.log(err);
        }
      
      
    },
    getSignup: (req, res) => {
        const errorMessage = req.query.error;
        res.render('signup',{errorMessage})
    },
    otpPage:async (req, res) => {
        if(req.session.data){
            const {number,channel} = req.session.data
            const verification =await sendOtp(number,channel)
            console.log(verification);
        }      
        const message = req.query.message  || req.flash('message')
        res.render('otp',{message})
    },
   
    getOtp: async (req,res) => {
        
        const {fname, lname, password, to,channel,email} = req.body
        
        const numberExist = await Users.findOne({number:to})
        if(numberExist ){            
            return  res.json({success: false, message: "Account already Exist"})
        }

        try{
                      
              const verification = await sendOtp(to,channel)
                    console.log(verification);
                    console.log('OTP sent successfully');
                    req.session.otpData = {
                        to: to,
                        channel: channel,
                        serviceSid: verification.serviceSid,
                    };    
                                      
                    console.log(req.session.otpData);
                    const newUser =  new Users({
                        firstName:fname,
                        lastName:lname,                       
                        number:to,
                        email,
                        password,
                        channel
                    })
                    await newUser.save()
                    req.session.userData = newUser
                    res.json({ success: true });
                     
            } catch (err) {
                console.log(err);
                res.json({ success: false});
            }     
    },
    ResendOtp: async (req, res) => {
        try{
            console.log(req.session.otpData);
            const {to,channel} = req.session.otpData

               const verification = await  sendOtp(to,channel)
                 
                     console.log('OTP sent successfully');
                     const message = 'OTP sent successfully'
                     res.render('otp',{message:message || ''})
                      
             } catch (err) {
                 console.log(err);

                 res.json({ success: false });             
                }     
    },
    postOtp:async (req,res) => {       

        const {otp}  = req.body        
        const {to,serviceSid} = req.session.otpData            
                try{
                   
                     const verification = await checkOtp(to,serviceSid,otp)
                    console.log(verification);

                    if(verification.status == "approved"){
                        await Users.findByIdAndUpdate(req.session.userData._id,{otp:true}) 
                        req.session.destroy()                   
                        res.json({ success: true });

                    } else {
                        res.json({ success: false, message: "Invalid OTP" });
                    }
                
                } catch(err){
                    console.log(err);
                }                        
    }

}