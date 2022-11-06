const express = require('express');
const app = express();
const router = express.Router();
const dbs = require('../dbConnect');
const fs = require('fs')
const db = dbs.getConnection();
const session = require('express-session');
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
var alert = require('alert');

app.use(express.static('../new'));
app.set('view engine', 'ejs'); 

// const fileContent = fs.readFileSync('../TheBloodbank/index.html');
const fileRegister = fs.readFileSync('../new/loginregister.html')
const staticOtpVerify = fs.readFileSync('../new/signinotpverify.html')//fs is used to server static files

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth:{
        user: 'testm1855@gmail.com',
        pass: 'nhgetrldgyzzxyev',
        // pintU2022@

    },
})

router.use(session({
    secret: "subscribe",
    resave: true,
    saveUninitialized: true,
    
}));

// admin routes
router.get("/adminpage",(req, res)=>{
    if(req.session.user === "pintu"){
        try{
            db.query("SELECT * FROM userdetails", async(err, result)=>{
                if(err){
                    console.log(err)
                }
                var data = {};
                for(var i =0; i<result.length; i++){
                    // console.log(result[i].ID)
                    data[result[i].ID] = await[{
                        id: result[i].ID,
                    name : result[i].Name,
                    provience : result[i].Provience,
                    district: result[i].District,
                    municipality: result[i].Municipality,
                    contact: result[i].Contact,
                    email: result[i].Email,
                    group : result[i].Blood_group,
                    verified: result[i].verified,
                    lives : result[i].Lives,
                    }]
                    
                }
                // console.log(data);
    
                res.render('admin', {result:data})
            })
        }
        catch(error){
            console.log(error)
        }

       
       
        
    }
    else{
        return res.redirect('/adminlogin')
    }
    
    
})

router.get('/adminevents',async(req, res)=>{
    if(req.session.user === "pintu"){
        try{
            const queryString = " Select userdetails.Name, eventsDetails.E_ID, eventsDetails.OrganizationName,eventsDetails.Provience, eventsDetails.District, eventsDetails.Municipality, eventsDetails.Date_time,eventsDetails.Contact, eventsDetails.Email From userdetails inner join eventsdetails on userdetails.ID = eventsdetails.U_ID;"
            db.query(queryString, async(err, result)=>{
                if(err){
                    console.log(err)
                }
                var data = {};
                for(var i =0; i<result.length; i++){
                    // console.log(result[i].ID)
                    data[result[i].E_ID] = await[{
                        id: result[i].E_ID,
                    name : result[i].Name,
                    orgname : result[i].OrganizationName,
                    provience : result[i].Provience,
                    district: result[i].District,
                    municipality: result[i].Municipality,
                    date: result[i].Date_time,
                    contact: result[i].Contact,
                    email: result[i].Email,

                    }]
                    
                }
                console.log(data);
    
                res.render('adminEvents', {result:data})
            })
        }
        catch(error){
            console.log(error)
        }

       
       
        
    }
    else{
        return res.redirect('/adminlogin')
    }
})

router.get('/editevent:id',(req, res)=>{
    if(req.session.user === "pintu"){
        const id = req.params.id
        
        res.render("editEvents")
        router.post("/editevents", (req, res)=>{
            const orgName = req.body.create_fname;
        const prov = req.body.create_provience;
        const dist = req.body.district;
        const mun = req.body.municipality;
        const date = req.body.meetingTime;
        const contact = req.body.create_contact;
        const email = req.body.create_email;
       
            // console.log(id)
            // console.log(name, dist)
            try{
                db.query("UPDATE eventsDetails SET OrganizationName =?, Provience=?, District=?, Municipality=?, Date_time=?, Contact=?, Email=? WHERE E_ID=? ",[orgName, prov, dist, mun,date,contact,email, id],(err, result)=>{
                    if(!err){
                        console.log(result)
                        return res.redirect('/adminpage')
                    }
                    else{
                        console.log(err)
                    }
                })
            }
            catch{
                console.log(err)
            }
    
    
    
        })
    }
    else{
        return res.redirect('/adminlogin')
    }
})

router.get('/deleteevent:id', (req, res)=>{
    if(req.session.user === "pintu"){
    const id = req.params.id
    // const user = req.body.userid
    console.log(id)
    queryString1 = "DELETE FROM eventsDetails WHERE E_ID = ?"
    // queryString2 = "DELETE FROM userdetails WHERE ID = ?"
    db.query(queryString1,[id], (err, results)=>{
        if(!err){
            console.log(results)
                    console.log("deleted")
                    return res.redirect('/adminpage')
        }
        else{
            console.log(err)
        }
    })
}

else{
    return res.redirect('/adminlogin')
}


    // return res.render("deleteUser")
})

router.get('/donorhistory:id',(req, res)=>{
    if(req.session.user === "pintu"){
        const id = req.params.id
        // const user = req.body.userid
        console.log(id)
        const queryString = " SELECT userdetails.Name, userdetails.Email, donorhistory.D_iD, donorhistory.OrganizationName, donorhistory.Date_time From userdetails inner join donorhistory on userdetails.ID = donorhistory.User_ID WHERE userdetails.ID = ?"
        db.query(queryString,[req.params.id], async(err, result)=>{
            if(err){
                console.log(err)
            }
            var data = {};
            for(var i =0; i<result.length; i++){
                // console.log(result[i].ID)
                data[result[i].D_iD] = await[{
                    id: result[i].D_iD,
                    name : result[i].Name,
                    email: result[i].Email,
                
                orgname : result[i].OrganizationName,
                date: result[i].Date_time,
              

                }]
                
            }
            console.log(data);

            res.render('adminDonorHistory', {result:data})
        })
    }
    
    else{
        return res.redirect('/adminlogin')
    }
})

router.post('/adminsearch',(req, res)=>{
    if(req.session.user === "pintu"){
    const email = req.body.email;
const name = req.body.name;
const contact = req.body.number;
const group = req.body.Blood_group;
console.log(email)

    try{
        db.query("SELECT * FROM userdetails WHERE Name=? AND Contact=? AND Email = ? AND  Blood_group=? ",[name, contact, email, group], async(err, result)=>{
            if(err){
                console.log(err)
            }
            var S_data = {};
            for(var i =0; i<result.length; i++){
                // console.log(result[i].ID)
                S_data[result[i].ID] = await[{
                    id: result[i].ID,
                name : result[i].Name, 
                provience : result[i].Provience,
                district: result[i].District,
                municipality: result[i].Municipality,
                contact: result[i].Contact,
                email: result[i].Email,
                group : result[i].Blood_group,
                verified: result[i].verified,
                lives : result[i].Lives,
                }]
                
            }
            // console.log(data);

            res.render('admin', {result:S_data})
            // res.redirect('/adminLogin')
        })
    }
    catch(error){
        console.log(error)
    }

// else if(email !==null && name !==null){
//     try{
//         db.query("SELECT * FROM userdetails WHERE Email = ?, Name =?",[email, name], async(err, result)=>{
//             if(err){
//                 console.log(err)
//             }
//             var S_data = {};
//             for(var i =0; i<result.length; i++){
//                 // console.log(result[i].ID)
//                 S_data[result[i].ID] = await[{
//                     id: result[i].ID,
//                 name : result[i].Name,
//                 provience : result[i].Provience,
//                 district: result[i].District,
//                 municipality: result[i].Municipality,
//                 contact: result[i].Contact,
//                 email: result[i].Email,
//                 group : result[i].Blood_group,
//                 verified: result[i].verified,
//                 lives : result[i].Lives,
//                 }]
                
//             }
//             // console.log(data);

//             res.render('admin', {result:S_data})
//             // res.redirect('/adminLogin')
//         })
//     }
//     catch(error){
//         console.log(error)
//     }
// }
    }
else{
    return res.redirect('/adminlogin')
}

})

router.get('/deleteuser:id', (req, res)=>{ //delete history first
    if(req.session.user === "pintu"){
    const id = req.params.id
    // const user = req.body.userid
    console.log(id)
    const queryString1 = "DELETE FROM eventsDetails WHERE U_ID = ?"
    // queryString2 = "DELETE FROM userdetails WHERE ID = ?"
    db.query(queryString1,[id], (err, results)=>{
        if(!err){
            console.log(results)
            db.query("DELETE FROM userdetails WHERE ID = ?",[id],(err, result)=>{
                if(!err){
                    console.log(result)
                    console.log("deleted")
                    return res.redirect('/adminpage')
                }
                else{
                    console.log(err)
                }
            })
        }
        else{
            console.log(err)
        }
    })
}

else{
    return res.redirect('/adminlogin')
}


    // return res.render("deleteUser")
})

router.get('/edituser:id',(req, res)=>{
    if(req.session.user === "pintu"){
    const id = req.params.id
    res.render("editUser")
    router.post("/edit", (req, res)=>{
        const name = req.body.create_fname;
        
        const prov = req.body.create_provience;
        const dist = req.body.create_address;
        const mun =req.body.create_municipality;
        const contact = req.body.create_contact;
        const group = req.body.blood_group
        // console.log(id)
        // console.log(name, dist)
        try{
            db.query("UPDATE userdetails SET Name =?, Provience=?, District=?, Municipality=?, Contact=?, Blood_group=? WHERE ID=? ",[name, prov, dist, mun,contact,group, id],(err, result)=>{
                if(!err){
                    console.log(result)
                    return res.redirect('/adminpage')
                }
                else{
                    console.log(err)
                }
            })
        }
        catch{
            console.log(err)
        }



    })
}
else{
    return res.redirect('/adminlogin')
}
})

router.get('/edithistory:id',(req, res)=>{
    if(req.session.user === "pintu"){
    const id = req.params.id
    res.render("edithistory")
    router.post("/edit", (req, res)=>{
        const orgname = req.body.organization;
        
        const date = req.body.date;
        
        // console.log(id)
        // console.log(name, dist)
        try{
            const queryString = "Update donorhistory set OrganizationName = ?, Date_time =?   where D_iD = ?"
            db.query(queryString, [orgname, date, id],(err, result)=>{
                if(!err){
                    console.log(result)
                    return res.redirect('/adminpage')
                }
                else{
                    console.log(err)
                }
            })
        }
        catch{
            console.log(err)
        }



    })
}
else{
    return res.redirect('/adminlogin')
}
})

router.get('/deletehistory:id', (req, res)=>{
    if(req.session.user === "pintu"){
    const id = req.params.id
    // const user = req.body.userid
    console.log(id)
    queryString1 = "DELETE FROM donorhistory WHERE D_iD = ?"
    // queryString2 = "DELETE FROM userdetails WHERE ID = ?"
    db.query(queryString1,[id], (err, results)=>{
        if(!err){
            console.log(results)
                    console.log("deleted")
                    return res.redirect('/adminpage')
        }
        else{
            console.log(err)
        }
    })
}

else{
    return res.redirect('/adminlogin')
}


    // return res.render("deleteUser")
})




//admin routes



// app.use(express.static('../new'));

// app.use('/css',express.static('../new/styles'));
// app.use('/css',express.static('../new/styles'));

router.get("/loginregister", (req, res) => {
    req.session.destroy();
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.end(fileRegister)
})



router.get("/ReRequestotp",async(req, res)=>{ //Resend otp for request donor
    if(req.session.user){
        console.log("otp resent for request")
        email =  req.session.user;
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
        
        db.query("UPDATE request SET otp = ? WHERE R_email = ? ",[hashedOtp,email],(err, result)=>{
            return res.render('otpVerify')
        })
        
        
    }
    else{
        return res.redirect('/loginregister')
    }


})



router.get("/userpage", (req, res) => {
    console.log(req.session.user)
    if(req.session.user){
        for(var i =0; i<=req.session.user.length; i++){
            if(req.session.user[i].Status){
            
            var user_data = {}
            // console.log(req.session.user[i].Status)
            db.query("SELECT  Name, Status FROM userdetails WHERE Email=?",[req.session.user[i].Email],(err, result)=>{
                if(err){
                    console.log(err)
                }
                else{
                   Uname = result[0].Name

                    status_data = req.session.user[i].Status
                    console.log(Uname, status_data)
                    return res.render('userpage',{resultname:Uname, result: status_data });
                }
            })
        }
        else{
            return res.redirect("/loginregister");
        }
            // console.log(req.session.user[i])
            break
        }
  
       
    }
    else{
       return res.redirect("/loginregister");
    }
})


router.get('/changestatus',(req, res)=>{
    if(req.session.user){
        for(var i =0; i<=req.session.user.length; i++){
            if(req.session.user[i].Status === "Online"){
                db.query(" update userdetails set Status = 'Offline' Where Email =?",[req.session.user[i].Email],(err, result)=>{
                    if(err){
                        console.log(err)
                    }
                    else{
                     req.session.user[i].Status = "Offline"
                        return res.redirect('/userpage')
                    }
                })
                break
            }
            if(req.session.user[i].Status === "Offline"){
                db.query(" update userdetails set Status = 'Online' Where Email =?",[req.session.user[i].Email],(err, result)=>{
                    if(err){
                        console.log(err)
                    }
                    else{
                        req.session.user[i].Status = "Online"
                        return res.redirect('/userpage')
                    }
                })
            
                break
            }
            // console.log(req.session.user[i].Status)
           
            // console.log(req.session.user[i])
            break
        }
    }
})

// router.get("/logout", (req, res)=>{
//     // res.cookie('jwt', '', {maxAge:1});
//     req.session.loggedIn = false;
//     res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
//     req.session.destroy();

//         res.redirect('/');
//     // if(req.session.email){
//     //     res.header('Cache-Control','no-cache');

//     //     req.session.destroy((err) => {
//     //         if(err){
//     //             return console.log(err)
//     //         }
//     //         res.redirect('./')
//     //     })
//     // } 
// });

router.post("/search",async(req, res)=>{
        const prov = req.body.subject;
        const dist = req.body.topic
        const mun = req.body.chapter;
        const group = req.body.BloodGroup;
        // console.log(prov)
        // console.log(dist)
        // console.log(mun)
        console.log("sorted")
        try{
           
            db.query(' Select userdetails.ID, userdetails.Name, userdetails.Provience, userdetails.District, userdetails.Municipality,  userdetails.Contact, userdetails.Email, userdetails.Blood_group, userdetails.Lives, userdetails.Status, donorhistory.D_iD, donorhistory.OrganizationName,  donorhistory.Date_time, donorhistory.User_ID From userdetails inner join donorhistory on userdetails.ID = donorhistory.User_ID WHERE userdetails.Provience = ? AND userdetails.Blood_group = ?',[prov,group], async(err, result)=>{
                if(err){
                    console.log(err)
                }
                var data = {};
                // for(var i =0; i<result.length; i++){
                //     if(result[i].ID in data){
                //         data[result[i].ID] 
                //         .push({
                           
                //             orgname: result[i].OrganizationName,
                //             date: result[i].Date_time
                //         })
                //         console.log("same");
                //     }
                //     // console.log(result[i].ID)
                //     else{
                //     data[result[i].ID] = await[{
                //     name : result[i].Name,
                //     provience : result[i].Provience,
                //     district: result[i].District,
                //     municipality: result[i].Municipality,
                //     contact: result[i].Contact,
                //     email: result[i].Email,
                //     group : result[i].Blood_group,
                //     lives : result[i].Lives,
                //     }]
                // }
                // }
                for(var i =0; i<result.length; i++){
                    if(result[i].ID in data){
                        data[result[i].ID] 
                        .push({
                           
                            orgname: result[i].OrganizationName,
                            date: result[i].Date_time
                        })
                        console.log("same");
                    }
                    else{
                    // console.log(result[i].ID)
                    data[result[i].ID] = await[{
                            name : result[i].Name,
                    provience : result[i].Provience,
                    district: result[i].District,
                    municipality: result[i].Municipality,
                    contact: result[i].Contact,
                    email: result[i].Email,
                    group : result[i].Blood_group,
                    lives : result[i].Lives,
                    status: result[i].Status,
                    orgname: result[i].OrganizationName,
                    date: result[i].Date_time
                    }]
                    console.log("diff");
                }
                    
                }
                console.log(data);
    
                res.render('i', {result:data})
            })
        }
        catch{
            console.log(err)
        }

        router.post("/request",async(req, res)=>{

            const reqEmail = req.body.request_email;
            const rec = "False";
            console.log(reqEmail)
            const GenOtp = `${100000 + Math.random()* 900000}`;
            const otp =parseInt(GenOtp);
            let otpString = otp.toString();
            const hashedOtp = await bcrypt.hash(otpString,8)
            console.log(hashedOtp)


            if(reqEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)){
                console.log("email pattern matched")
                 var mailOptions = {
                from : '"verify email" <codewiththisid36@gmail.com>',
                to : reqEmail,
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
                               
                   
            db.query("INSERT INTO request(R_email, otp, received) VALUES(?,?,?)",[reqEmail,hashedOtp, rec], async(err, result)=>{
                    if(err){
                    console.log("falied" + err)
                     //res.sendStatus(500);   
                }
                else{
                    const inserted_id = result.insertId;
                    console.log(inserted_id)
            
                // console.log(results)
                r_data = {
                    id: inserted_id,
                    email: reqEmail
                }
                console.log(req.session)
                req.session.user = r_data;
                req.session.loggedIn = true;
                console.log(req.session.user);
                console.log(req.session);


                req.session.cookie.expires = new Date(Date.now()+ 60*60*24)
                req.session.cookie.maxAge = 60 * 60 * 24;
            
                   
                    
                    // res.render('otpVerify',{
                    //     id: response.id
                    // })
                    return res.render('otpVerify')
                }
            })
                    
                  
                    
                       
                        
              
    
             
            }
            else{
                console.log("not matched")
                return res.redirect('/')
            }

           
           


                // db.query('SELECT ID, Email FROM userdetails WHERE Provience = ? AND Blood_group = ? ',[prov,group], async (err, results)=>{
                //     // console.log(results);
                //     res.end("request")
                //     var emailData = {};
                //     for(var i =0; i<results.length; i++){
                //         emailData[results[i].ID] = await[{
                //             email: results[i].Email,
                //         }]
                //     }
                //     // let text = results.toString();
                //     // console.log(text)
                //     for(var key in emailData){
                //         for(var prop in emailData[key]){
                //             if(prop == 0){
                //                 console.log(emailData[key][prop].email)
                //                 var mailOptions = {
                //                     from : '"verify email" <codewiththisid36@gmail.com>',
                //                     to : emailData[key][prop].email,
                //                     subject:"Request",
                //                     html: `Urgent Blood Required. Please Contact ${Cnumber}`
                //                 }
                        
                //                 transporter.sendMail(mailOptions, (error, info)=>{
                //                     if(error){
                //                         console.log(error)
                //                     }
                //                     else{
                //                         console.log("verificaion sent")
                        
                        
                                    
                //                         // res.render('otpVerify',{
                //                         //     id: response.id
                //                         // });
                                       
                //                     }
                //                 })
                //             }
                //         }
                //     }
                    
                // })
                // res.redirect('/confirm')
                    
        })
        router.post("/otpVerification",(req,res)=>{
            try{
                console.log('opt')
                console.log(req.session.user);
                const id = req.session.user.id
            console.log(id)
                const otp = req.body.token;
                if(req.session.user){
                    console.log(req.session.user.id)
                    db.query('SELECT R_email FROM request WHERE R_ID',[id], async (err, results)=>{
                        if(req.session.user.email.localeCompare(results))
                        {
                            
                            // res.send(req.session.user)
                            console.log("matched");
                            console.log(req.session.user)
                            const email = req.session.user.email;
        
                            db.query('SELECT otp from request WHERE R_ID=?',[id], async(err, result)=>{
                                console.log(result)
                                // const id = jsonObj.getInt("id")
                                console.log(result[0].otp)
                                const num = result[0].otp
                                if(await bcrypt.compare(otp,num)){
                                    console.log('verified');
                                    return res.redirect('/requestinfo')
                                }
                                else{
                                    console.log('wrong otp')
                                    return( alert('Wrong OTP'),console.log("registation failed"), res.render('otpVerify'))
                                }
                            })
                            
                        }
                        else{
                            console.log('email not found')
                        }
                    // console.log(results)
                })
                }
                else{
                   return res.render('/')
                }
                
            }
            catch(error){
                console.log(error);
            }
        })

        router.post('/createrequest',(req, res)=>{
            const name = req.body.create_fname;
            const add = req.body.address
            const contact = req.body.create_contact;
            const id = req.session.user.id
            const reqEmail =req.session.user.email
            console.log(id)


            // req.session.loggedIn = false;
            // res.header('Cache-Control','no-cache');
            // req.session.destroy();
                
            
            db.query('SELECT ID, Email FROM userdetails WHERE Provience = ? AND Blood_group = ? ',[prov,group], async (err, results)=>{
                    // console.log(results);
                    // res.end("request")
                    var emailData = {};
                    for(var i =0; i<results.length; i++){
                        emailData[results[i].ID] = await[{
                            email: results[i].Email,
                        }]
                    }
                    // let text = results.toString();
                    // console.log(text)
                    for(var key in emailData){
                        for(var prop in emailData[key]){
                            if(prop == 0){
                                console.log(emailData[key][prop].email)
                                var mailOptions = {
                                    from : '"pintU" <codewiththisid36@gmail.com>',
                                    to : emailData[key][prop].email,
                                    subject:"Request",
                                    html: `Urgent Blood Required to ${name}. Please Contact ${contact}. At ${add}`
                                }
                        
                                transporter.sendMail(mailOptions, (error, info)=>{
                                    if(error){
                                        console.log(error)
                                    }
                                    else{
                                        console.log("urgentblood mail sent")
                        
                        
                                    
                                        // res.render('otpVerify',{
                                        //     id: response.id
                                        // });
                                       
                                    }
                                })
                            }
                        }
                    }
                    var mailOptions = {
                        from : '"pintU" <codewiththisid36@gmail.com>',
                        to : reqEmail,
                        subject:"Confirmation Mail",
                        html: `Your Request has been sent. Your ID is ${id}`
                    }
                    transporter.sendMail(mailOptions, (error, info)=>{
                        if(error){
                            console.log(error)
                        }
                        else{
                            console.log("confirmation mail sent")
            
            
                        
                            // res.render('otpVerify',{
                            //     id: response.id
                            // });
                           
                        }
                    })
                  

                    
                })

       
                req.session.loggedIn = false;
                res.header('Cache-Control','no-cache');
                req.session.destroy();
                // res.redirect('/confirm')
                res.redirect('/');
        })
        
})


router.get("/checkid",(req, res)=>{
    return res.render('checkid')
})

router.post("/checkid",(req, res)=>{
    const id= req.body.token
    db.query("SELECT received FROM request WHERE R_ID=?",[id],(err, result)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log(result[0].received)
            if(result[0].received === "TRUE"){
                return res.redirect('/')
            }
            else{
                console.log(req.session)
                req.session.user = id;
                req.session.loggedIn = true;
                console.log(req.session.user);
                console.log(req.session);

                return res.render('confirm')
            }
        }
    })
})

router.post('/received',(req, res)=>{
   
    if(req.session.user){
        const fname = req.body.create_fname;
        const email = req.body.create_email;
        const id = req.session.user
        console.log(id)
        db.query('SELECT Email FROM userdetails', async(err, result)=>{
            console.log(result);

            for(var i = 0; i<result.length; i++){
                console.log(result[i].Email)
                if(email.localeCompare(result[i].Email)){
                    db.query('update userdetails set Lives = Lives + 1 Where Email =?',[email],(err, results)=>{
                        console.log("Lives incremented of"+email)
                        db.query('UPDATE request SET received = "TRUE" WHERE R_ID=?',[id],(err, result)=>{
                            if(err){
                                console.log(err)
                            }
                            else{
                                console.log(result)
                                return res.redirect('/')
                            }
                        })
                        // res.redirect('/')
                    })
                   
                    
                break
                }
              else{
                console.log('not matched')
                return( alert('email is incorrect'),console.log("wrong info"), res.redirect('/checkid'))
    
              }
              
                
            }
            
            
               
                
                
        
            
        })
    }
    else{
        return res.redirect('./')
    }
   
   
})

router.post("/addEvents",(req,res)=>{
    const orgName = req.body.create_fname;
        const prov = req.body.create_provience;
        const dist = req.body.district;
        const mun = req.body.municipality;
        const date = req.body.meetingTime;
        const contact = req.body.create_contact;
        const email = req.body.create_email;
        // console.log(orgName, prov, dist, mun, date, contact, email)
        // console.log(req.session.user.length)
        for(var i =0; i<=req.session.user.length; i++){
            console.log(req.session.user[i].ID)
            console.log(req.session.user[i].password)
            const queryString = "INSERT INTO eventsDetails (OrganizationName, Provience, District,  Municipality, Date_time, Contact, Email, U_ID)VALUES(?,?,?,?,?,?,?,?) "
            db.query(queryString, [orgName, prov, dist, mun, date, contact, email,req.session.user[i].ID], (err, result)=>{
                if(err){
                    console.log(err)
                }
                else{
                    
                    console.log(result)
                    console.log("inserted")
                    db.query("SELECT ID, Email From userdetails",async(err, results)=>{
                        var emailData = {};
                    for(var i =0; i<results.length; i++){
                        emailData[results[i].ID] = await[{
                            email: results[i].Email,
                        }]
                    }
                    for(var key in emailData){
                        for(var prop in emailData[key]){
                            if(prop == 0){
                                console.log(emailData[key][prop].email)
                                var mailOptions = {
                                    from : '"pintu" <codewiththisid36@gmail.com>',
                                    to : emailData[key][prop].email,
                                    subject:"New Event",
                                    html: `Blood Donation Event at ${mun}, ${dist}. Event on ${date}. Organized by ${orgName}. For more information contact ${contact}`
                                }
                        
                                transporter.sendMail(mailOptions, (error, info)=>{
                                    if(error){
                                        console.log(error)
                                    }
                                    else{
                                        console.log("mail sent")
                        
                        
                                    
                                        // res.render('otpVerify',{
                                        //     id: response.id
                                        // });
                                       
                                    }
                                })
                            }
                        }
                    }
                    })
                }
            })
            break
        }
        res.redirect('/userpage')
})

// router.post("/request",(req, res)=>{

//     const Cnumber = req.body.phoneNumber;
//     console.log(Cnumber)
//         db.query('SELECT ID, Email FROM userdetails', async (err, results)=>{
//             // console.log(results);
//             res.end("request")
//             var emailData = {};
//             for(var i =0; i<results.length; i++){
//                 emailData[results[i].ID] = await[{
//                     email: results[i].Email,
//                 }]
//             }
//             // let text = results.toString();
//             // console.log(text)
//             for(var key in emailData){
//                 for(var prop in emailData[key]){
//                     if(prop == 0){
//                         console.log(emailData[key][prop].email)
//                         var mailOptions = {
//                             from : '"verify email" <codewiththisid36@gmail.com>',
//                             to : emailData[key][prop].email,
//                             subject:"Request",
//                             html: `Urgent Blood Required. Please Contact ${Cnumber}`
//                         }
                
//                         transporter.sendMail(mailOptions, (error, info)=>{
//                             if(error){
//                                 console.log(error)
//                             }
//                             else{
//                                 console.log("verificaion sent")
                
                
                            
//                                 // res.render('otpVerify',{
//                                 //     id: response.id
//                                 // });
                               
//                             }
//                         })
//                     }
//                 }
//             }
            
//         })
//         res.end("gello")
            
// })

// router.get("/", (req,res) => {

//     res.end(fileContent);
// })

router.post('/donorhistory',(req, res)=>{
    console.log(req.session.user.ID)
    const orgName = req.body.organization;
    const date = req.body.date;
    for(var i =0; i<=req.session.user.length; i++){
        db.query("INSERT INTO donorhistory (OrganizationName, Date_time, User_ID) VALUES(?,?,?)",[orgName,date, req.session.user[i].ID],(err, result)=>{
            if(err){
                console.log(err)
            }
            else{
                console.log(result)
                    console.log("inserted")
                    
                    return res.redirect("/userpage")
                    

            }
        })
        break;
    }
      
})

router.get('/forgetpassword',(req, res)=>{

    return res.render("forgetpwd")
})

router.post('/forgetpwd',(req, res)=>{
    const email = req.body.create_email
     db.query("SELECT Email From userdetails WHERE Email = ?",[email],async(err, result)=>{
        
        console.log(result)
        const GenOtp = `${100000 + Math.random()* 900000}`;
        const otp =parseInt(GenOtp);
        let otpString = otp.toString();
        const hashedOtp = await bcrypt.hash(otpString,8)
        console.log(hashedOtp)

        var mailOptions = {
            from : '"pintnU" <codewiththisid36@gmail.com>',
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
                if(err){
                    console.log("falied" + err)
                        //res.sendStatus(500);   
                   }
                    else{
                             console.log(req.session)
                            req.session.user = email;
                            req.session.loggedIn = true;
                            console.log(req.session.user);
                            console.log(req.session);


                            req.session.cookie.expires = new Date(Date.now()+ 60*60*24)
                            req.session.cookie.maxAge = 60 * 60 * 24;

                            // res.render('otpVerify',{
                            //     id: response.issd
                            // })
                           return res.render('fotpVerify')
                        }
            })
    })
})


router.post("/fotpVerification",(req,res)=>{
    try{
        console.log('opt')
        console.log(req.session.user);

        const otp = req.body.token;
        if(req.session.user){
            db.query('SELECT Email FROM userdetails', async (err, results)=>{
                if(req.session.user.localeCompare(results))
                {
                    
                    // res.send(req.session.user)
                    console.log("matched");
                    console.log(req.session.user)
                    const email = req.session.user;

                    db.query('SELECT otp from userdetails WHERE Email=?',[email], async(err, result)=>{
                        console.log(result)
                        // const id = jsonObj.getInt("id")
                        console.log(result[0].otp)
                        const num = result[0].otp
                        if(await bcrypt.compare(otp,num)){
                            console.log('verified');
                            return res.render('changepwd')
                        }
                        else{
                            console.log('wrong otp')
                            return res.redirect('/forgetpassword')
                        }
                    })
                    
                }
                else{
                    console.log('email not found')
                }
            // console.log(results)
        })
        }
        else{
           return res.render('/')
        }
        
    }
    catch(error){
        console.log(error);
    }
})

router.post('/changepwd',async(req, res)=>{
    const pwd = req.body.create_password
    const cpwd = req.body.confirm_password
    console.log(req.session.user.Email)
    if(req.session.user){
        db.query('SELECT Email FROM userdetails WHERE Email= ?', [req.session.user], async(err, results)=>{
        let hashedpwd = await bcrypt.hash(pwd, 8);
            console.log(hashedpwd)
            if(pwd !== cpwd){
                return( alert('password dont match'),console.log("incorect password"), res.redirect('/loginregister'));
            }

            else{
                db.query("Update userdetails set password = ? where Email = ?",[hashedpwd,req.session.user],(err, result)=>{
                    if(err){
                        console.log("falied" + err)
                         //res.sendStatus(500);   
                    }
                    else{
                        req.session.loggedIn = false;
                res.header('Cache-Control','no-cache');
                req.session.destroy();
                // res.redirect('/confirm')
                res.redirect('/loginregister');

                    }
                })
            }

        })
        
    }
})


module.exports = router;