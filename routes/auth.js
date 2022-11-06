const express = require('express');
const app = express();
const router = express.Router();
const dbs = require('../dbConnect');
const bodyParser = require('body-parser');
const fs = require('fs')
// const { response } = require('express');
const messagebird = require('messagebird')('o5vixgkB0y5z0Id24rYiz3HVl')
const bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
const { response } = require('express');
const session = require('express-session')
const db = dbs.getConnection();

var alert = require('alert');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static('../new'));
app.set('view engine', 'ejs'); 


const otpVerify = fs.readFileSync('../new/signinotpverify.html')

router.use(session({
    secret: "subscribe",
    resave: true,
    saveUninitialized: true,
    
}));

let testAccount =  nodemailer.createTestAccount();

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth:{
        user: 'testm1855@gmail.com',
        pass: 'nhgetrldgyzzxyev',
        // pintU2022@

    },
})

router.post("/adminlogin",(req, res)=>{
    try{
        const username = req.body.username;
        const pass = req.body.password;
        // console.log(username, pass)
        if(username === "pintu" && pass === "pintu"){
            
            console.log(req.session)
            req.session.user = username;
            req.session.loggedIn = true;
            console.log(req.session.user);
            console.log(req.session);


            req.session.cookie.expires = new Date(Date.now()+ 60*60*24)
            req.session.cookie.maxAge = 60 * 60 * 24;
            console.log("logged in");
            return res.redirect("/adminpage")
        }
        else{
            console.log("login failed")
        }

    }
    catch(error){
        console.log(error);
    }
})




router.post("/register", async(req, res)=>{
    var letters = /^[a-zA-Z]+ [a-zA-Z]+$/;
        const fname = req.body.create_fname;
        const prov = req.body.create_provience;
        const dist = req.body.create_address
        const mun = req.body.create_municipality;
        const contact = req.body.create_contact;
        const email = req.body.create_email;
        const password = req.body.create_password;
        const ConfrimPassword = req.body.confirm_password;
        const group = req.body.blood_group;
        const lives = 0;
        const verified = "False"
        const status ="Online"

        const GenOtp = `${100000 + Math.random()* 900000}`;
        const otp =parseInt(GenOtp);
        let otpString = otp.toString();
            const hashedOtp = await bcrypt.hash(otpString,8)
            console.log(hashedOtp)


       

        db.query('SELECT Email FROM userdetails WHERE Email=?',[email], async(err, results)=>{
            if(err){
                console.log(err);
            }
            console.log(results)
          
            if(results.length>0 ){
               return( alert('email exsts'),console.log("registation failed"), res.redirect('/loginregister'))
            }    
               
      
        db.query('SELECT Contact FROM userdetails WHERE Contact= ?',[contact], async(err, result)=>{
            if(err){
                console.log(err);
            }
            console.log(result)
           
            
            if(result.length>0){
                return( alert('Number Exists'),console.log("registation failed"), res.redirect('/loginregister'))
            }      
        
            
            let hashedPassword = await bcrypt.hash(password, 8);
            console.log(hashedPassword)



            if(!(fname.match(letters))){
                return( alert('pattern matched failed'),console.log("Please enter correct FullName"), res.redirect('/loginregister'))
               
            }

            if(contact.length >10 || contact.length <10){
                return( alert('incorrect number'),console.log("incorect number"), res.redirect('/loginregister'));
            }

            if(password !== ConfrimPassword){
                return( alert('password dont match'),console.log("incorect password"), res.redirect('/loginregister'));
            }

            else{
                if(email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
                    
                    const queryString ="INSERT INTO userdetails(Name, Provience, District, Municipality,Contact, password,Email, Blood_group, otp,verified, Lives, Status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) "
                    db.query(queryString, [fname, prov, dist, mun,contact, hashedPassword, email, group, hashedOtp,verified, lives, status], (err, result)=>{
                        if(err){
                            console.log("falied" + err)
                             //res.sendStatus(500);   
                        }
                       
                    // alert('Account created successfully');
                    else{
                        db.query('SELECT ID, Email, password, Status FROM userdetails WHERE Email = ?', [email], async (err, results)=>{
                            if(err){
                                console.log("falied" + err)
                                  
                            }
                            else{
                                var mailOptions = {
                                    from : '"pintU" <codewiththisid36@gmail.com>',
                                    to : email,
                                    subject:"verify",
                                    html: `<p> You OTP is <b>${otp}</b></p>`
                                }
                        
                                transporter.sendMail(mailOptions, (error, info)=>{
                                    if(error){
                                        console.log(error)
                                    }
                                    else{
                                        console.log("verificaion sent")
                        
                        
                                    
                                      
                                       
                                    }
                                })
                                console.log("inserted sucessfully")
                            
                        //  res.redirect("/loginregister");
                        console.log(req.session)
                        req.session.user = results;
                       
                        req.session.loggedIn = true;
                        console.log(req.session.user);
                        console.log(req.session);
        
        
                        req.session.cookie.expires = new Date(Date.now()+ 60*60*24)
                        req.session.cookie.maxAge = 60 * 60 * 24;
                        console.log("logged in");

                        // res.render('otpVerify',{
                        //     id: response.id
                        // })
                        db.query("SELECT ID FROM userdetails WHERE Email=?",[email],(err, results)=>{
                            db.query("INSERT INTO donorhistory(OrganizationName, Date_time, User_ID) VALUES(?,?,?)",[null, null, results[0].ID],(err, result)=>{
                                console.log(results)
                                console.log("instered into donor history")
                            })
                        })
                        
                       return res.render('RegisterOtp')
                            }
                        })
                        
                        
                    }
                       
        
                    })
                }
                else{
                    return( alert('email is incorrect'),console.log("registation failed"), res.redirect('/loginregister'))
                }
               }
            })
            })

        
        

        // const sendOTPVerificationEmail = async ({email}, res)=>{
        //     try{
        //         const otp = `${1000 + Math.random()* 9000}`;
        
        //         const mailOPtions ={
        //             from: '"pintu"<pintu@example.com>',
        //             to: email,
        //             subject : "verufy email",
        //             html: `<p>Enter ${otp}</p>` 
        
        //         };
        //         // const hashedOTP = await bcrypt.hash(otp, 8);
        //         await transporter.sendMail(mailOPtions);
        //     }
        //     catch(error){
        //         res.json({
        //             status: "Failed",
        //             message: error.message,
        //         })
        //     }
        // }
        
})//register


router.post("/otpVerify",(req,res)=>{
    try{
        // console.log('opt')
        // console.log(req.session.user);

        const otp = req.body.token;
        if(req.session.user){
            for(var i =0; i<=req.session.user.length; i++){
            console.log(req.session.user[i].Email)
            db.query('SELECT Email FROM userdetails', async (err, results)=>{
                for(var j =0; j<results.length; j++){
                if(req.session.user[i].Email === results[j].Email)
                {
                    
                    // res.send(req.session.user)
                    console.log("matched");
                    // console.log(req.session.user)
                    const email = req.session.user[i].Email;

                    db.query('SELECT otp, Email from userdetails WHERE Email=?',[email],async (err, result)=>{
                        console.log(result[0].Email)
                        // const id = jsonObj.getInt("id")
                        
                        console.log(result[0].otp)
                        const num = result[0].otp
                        if(await bcrypt.compare(otp,num)){
                            console.log('verified');
                            db.query('Update userdetails set verified = "True" where Email = ?',[email],(err, sresult)=>{
                                if(err){
                                    console.log(err)
                                }
                                else{
                                    // console.log(result[0].Email)
                                    // console.log(result)
                                    return res.redirect('/userpage')
                                }
                                
                            })

                           
                        }
                        else{
                            console.log('wrong otp')
                            return( alert('Wrong OTP'),console.log("registation failed"), res.render('RegisterOtp'))
                        }
                    })
                    break
                    
                }
                else{
                    console.log('email not found')
                }
                
            }
            
            // console.log(results)
        })
        break
        }
    }
        else{
           return res.render('/')
        }
        
    }
    catch(error){
        console.log(error);
    }
})

// router.post("/otpLoginVerify",(req,res)=>{
//     try{
//         // console.log('opt')
//         // console.log(req.session.user);

//         const otp = req.body.token;
//         console.log(req.session.user.Email)
//         if(req.session.user){
//             for(var i =0; i<=req.session.user.length; i++){
//             console.log(req.session.user[i].Email)
//             db.query('SELECT Email FROM userdetails', async (err, results)=>{
//                 for(var j =0; j<results.length; j++){
//                 if(req.session.user[i].Email === results[j].Email)
//                 {
                    
//                     // res.send(req.session.user)
//                     console.log("matched");
//                     // console.log(req.session.user)
//                     const email = req.session.user[i].Email;

//                     db.query('SELECT otp, Email from userdetails WHERE Email=?',[email],async (err, result)=>{
//                         console.log(result[0].Email)
//                         // const id = jsonObj.getInt("id")
                        
//                         console.log(result[0].otp)
//                         const num = result[0].otp
//                         if(await bcrypt.compare(otp,num)){
//                             console.log('verified');
//                             db.query('Update userdetails set verified = "True" where Email = ?',[email],(err, sresult)=>{
//                                 if(err){
//                                     console.log(err)
//                                 }
//                                 else{
//                                     // console.log(result[0].Email)
//                                     // console.log(result)
//                                     return res.redirect('/userpage')
//                                 }
                                
//                             })

                           
//                         }
//                         else{
//                             console.log('wrong otp')
//                             return res.redirect('/loginregister')
//                         }
//                     })
//                     break
                    
//                 }
//                 else{
//                     console.log('email not found')
//                 }
                
//             }
            
//             // console.log(results)
//         })
//         break
//         }
//     }
//         else{
//            return res.render('/')
//         }
        
//     }
//     catch(error){
//         console.log(error);
//     }
// })

router.get("/Reotp",async(req, res)=>{ //first otp resend, register garda ko
    if(req.session.user){
        console.log("otp resent for Register ")
        console.log(req.session.user[0].Email)
        email =  req.session.user[0].Email;
        const GenOtp = `${100000 + Math.random()* 900000}`;
        const otp =parseInt(GenOtp);
        let otpString = otp.toString();
        const hashedOtp = await bcrypt.hash(otpString,8)
        console.log(hashedOtp)

        var mailOptions = {
            from : '"pintU" <codewiththisid36@gmail.com>',
            to : email,
            subject:"verify",
            html: `<p> You OTP is ${otp}</p>`
        }

        transporter.sendMail(mailOptions, (error, info)=>{
            if(error){
                console.log(error)
            }
            else{
                console.log("verificaion sent")


            
                // res.render('otpVerify',{
                //     id: response.id
                // });
               
            }
        })
        
        db.query("Update userdetails set otp = ? where Email = ?",[hashedOtp,email],(err, result)=>{
            return res.render('RegisterOtp')
        })
        
        
    }
    else{
        return res.redirect('/loginregister')
    }


})



// router.post('/resend',(req, res)=>{
//     console.log("resent otp")
// })


router.post('/login',  async(req, res)=>{
    console.log(req.session)
    try{
        const email = req.body.email;
        const password = req.body.password;
       

        if(!email || !password){
            return( alert('enter email and password'),console.log("log in failed"))  
        }
            db.query("SELECT ID, Email, verified, Status FROM userdetails WHERE Email = ?",[email],async(err, result)=>{
                const data = result;
                
                if(result[0].verified === "True"){
                    db.query('SELECT ID, Email, password, Status FROM userdetails WHERE Email = ?', [email], async (err, results)=>{
                        console.log(results)
                            
                            if(!results || !(await bcrypt.compare(password, results[0].password))){
                                 res.status(401)
                                 
                                // return( alert('email or passowrd is incorrect'),console.log("login failed"), res.redirect('/loginregister'));
                                alert('email or passowrd is incorrect')
                                console.log("login failed")
                                return res.redirect('/loginregister')
        
                            } 
                            else{
                                // let user;
                                
                                console.log(req.session)
                                req.session.user = results;
                                req.session.loggedIn = true;
                                console.log(req.session.user);
                                console.log(req.session);
                                
                                
                                req.session.cookie.expires = new Date(Date.now()+ 60*60*24)
                                req.session.cookie.maxAge = 60 * 60 * 24;
                                console.log("logged in");
                               
                                return res.redirect("/userpage")
                                
                                
                            }
                            
                            
                            
                           
                            
                    })
                }
                else{
                    const GenOtp = `${100000 + Math.random()* 900000}`;
                    const otp =parseInt(GenOtp);
                    let otpString = otp.toString();
                        const hashedOtp = await bcrypt.hash(otpString,8)
                        console.log(hashedOtp)

                        var mailOptions = {
                            from : '"verify email" <codewiththisid36@gmail.com>',
                            to : email,
                            subject:"verify",
                            html: `<p> You OTP is ${otp}</p>`
                        }
                
                        transporter.sendMail(mailOptions, (error, info)=>{
                            if(error){
                                console.log(error)
                            }
                            else{
                                console.log("verificaion sent")
                               
                            }
                        })
                        db.query("Update userdetails set otp = ? where Email = ?",[hashedOtp,email],(err, result)=>{
                            req.session.user = data;
                    req.session.loggedIn = true;
                    console.log(req.session.user);
                    console.log(req.session);
                    
                    
                    req.session.cookie.expires = new Date(Date.now()+ 60*60*24)
                    req.session.cookie.maxAge = 60 * 60 * 24;
                    console.log("otp not verified")
                    return res.render('RegisterOtp')
                        })


                    
                    
                }
            })
            
           
          

  
        
    }
    catch(error){
        console.log(error);
    }
    })

    

// router.post("/register", (req, res)=>{
//     console.log(req.body)
   
//     const contact = req.body.create_contact;

//     messagebird.verify.create(contact,{
//         template: 'Your verification code is %token'
//     },(err, response)=>{
//         if(err){
//             console.log(err)
//             res.render('i')
//         }
//         else{
//             console.log(response)
//             res.render('otpVerify',{
//                 id: response.id
//             })
//         }
//     })    
// })

// router.post('/step3',(req, res)=>{
//     const id = req.body.id
//     const token = req.body.token

//     messagebird.verify.verify(id, token,(error, response)=>{
//         if(err){
//             res.render('otpVerify',{
//                 error: err.errors[0].description,
//                 id:id
//             })
//         }
//         else{
//             res.render('step4')
//         }
//     }) 
// })



module.exports = router;