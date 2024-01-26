const Users = require('../model/users')
const twilio = require('twilio');
require('dotenv').config()


const authToken = process.env.TWILIO_AUTH_TOKEN
const accountSid = process.env.TWILIO_ACCOUNT_SID
const verifySid = process.env.TWILIO_SERVICE_SID
const client = twilio(accountSid, authToken)


module.exports = {
    getLogin: (req,res) => {
        const errorMessage = req.flash('error')
        res.render('login',{errorMessage});
    },
    postLogin:async (req, res) => {
        const {number, password} = req.body
        try{
            const user = await Users.findOne({number})
            console.log(user);
            if(!user){
                req.flash('error','Invalid username or password')
                return res.redirect('/')
            }else {
                
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
        const errMessage = req.flash('error')
        res.render('signup',{errMessage})
    },
    otpPage:(req, res) => {
        const errorMessage = req.flash('error')
        res.render('otp',{errorMessage})
    },
   
    getOtp: async (req,res) => {
        
        const { to,channel} = req.body 
        console.log(req.body);
       

        try{
    
           const service = await client.verify.v2.services
            .create({
                friendlyName: 'YourServiceFriendlyName',
            })             

              const verification = await  client.verify.v2.services(service.sid)
                .verifications.create({
                    to:to,
                    channel:channel,
                })

                
                    console.log('OTP sent successfully');
                    req.session.userData = req.body
                    console.log(req.session.userData);
                    req.session.otpData = {
                        to: to,
                        channel: channel,
                        serviceSid: service.sid,
                    };
                    const errorMessage = req.flash('error') || ''
                    res.render('otp',{errorMessage})
                     
            } catch (err) {
                console.log(err);
                res.json({message:'Error'})
            }     
    },
    ResendOtp: async (req, res) => {
        try{
    
            const otpData = req.session.otpData

            const {to,channel, serviceSid} = otpData
                    
 
               const verification = await  client.verify.v2.services(serviceSid)
                 .verifications.create({
                     to:to,
                     channel:channel,
                 })
                 
                     console.log('OTP sent successfully');
                     const errorMessage = req.flash('error') || ''
 
                     res.render('otp',{errorMessage})
                      
             } catch (err) {
                 console.log(err);

                 res.json({message:'Error'})
             }     
    },
    postOtp:async (req,res) => {
        
        const {fname, lname, email, password} = req.session.userData

        const {otp}  = req.body
        
        const otpData = req.session.otpData

        const {to, serviceSid} = otpData

       const verification = await client.verify.v2
            .services(serviceSid)
            .verificationChecks.create({to:to, code:otp})
            if(verification.status == "approved"){
                try{
                    const newUser =  new Users({
                        firstName:fname,
                        lastName:lname,
                        email,
                        number:to,
                        password
                    })
                    await newUser.save()
              
                    res.render('verifysuccessfull')
                } catch(err){
                    console.log(err);
                }     
           
            } else {
                req.flash('error', 'Invalid otp')
                res.redirect('/send-otp')
            }
    
            
        res.redirect('/')
        
    }

}