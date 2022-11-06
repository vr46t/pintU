// const express = require('express');
// const app = express();
// const router = express.Router();
// const dbs = require('../dbConnect');
// const fs = require('fs')
// const db = dbs.getConnection();
// const session = require('express-session');
// const nodemailer = require("nodemailer");
// const bodyParser = require('body-parser');

// app.use(express.static('../new'));
// app.set('view engine', 'ejs'); 

// // const fileContent = fs.readFileSync('../TheBloodbank/index.html');
// const fileRegister = fs.readFileSync('../new/loginregister.html')
// const otpVerify = fs.readFileSync('../new/signinotpverify.html')//fs is used to server static files

// app.use(bodyParser.urlencoded({
//     extended: true
// }));
// app.use(bodyParser.json());

// let transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     auth:{
//         user: 'testm1855@gmail.com',
//         pass: 'nhgetrldgyzzxyev',
//         // pintU2022@

//     },
// })

// router.use(session({
//     secret: "subscribe",
//     resave: true,
//     saveUninitialized: true,
    
// }));

// // router.get("/adminpage",(req, res)=>{
// //     res.render('admin')
// // })


// module.exports = router;