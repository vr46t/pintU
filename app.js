const express = require('express');
const app = express();
const dbs = require('./dbConnect');
const bodyParser = require('body-parser')
const session = require('express-session');
const router = require('./routes/auth');

const db = dbs.getConnection();

app.use(session({
    secret: "subscribe",
    resave: true,
    saveUninitialized: true,
    
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static('../new'));


db.connect((error) => {
    if(error){
        console.log(error)
    }
    else{
        console.log("mysql Connected");
    }
})

app.set('view engine', 'ejs'); //intsall ejs. used to serve ejs files

// app.get("/", function(req, res){

//     res.render('i')
// })


app.get("/", function(req, res){
   
    // req.session.loggedIn = false;
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    req.session.destroy();
    // console.log(req.session)
    try{
        const queryString = " Select userdetails.ID, userdetails.Name, userdetails.Provience, userdetails.District, userdetails.Municipality,  userdetails.Contact, userdetails.Email, userdetails.Blood_group, userdetails.Lives, userdetails.Status, donorhistory.D_iD, donorhistory.OrganizationName,  donorhistory.Date_time, donorhistory.User_ID From userdetails inner join donorhistory on userdetails.ID = donorhistory.User_ID"
        db.query(queryString, async(err, result)=>{
            if(err){
                console.log("falied" + err)
            }
            var data = {};

            // for(var i =0; i<result.length; i++){
            //     if(result[i].ID in data){
            //         data[result[i].ID] 
            //         console.log(result);
            //     }
            //     else{
            //    data[result[i].ID = await [{
            //     name : result[i].Name,
            //     provience : result[i].Provience,
            //     district: result[i].District,
            //     municipality: result[i].Municipality,
            //     contact: result[i].Contact,
            //     email: result[i].Email,
            //     group : result[i].Blood_group,
            //    }]]
            // }}
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

            res.render('home', {result:data})
        })
    }
    catch{
        console.log(err)
    }
})

app.get("/logout", (req, res,next)=>{
    // res.cookie('jwt', '', {maxAge:1});
    req.session.loggedIn = false;
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    
    req.session.destroy();

        res.redirect('/');
    // if(req.session.email){
    //     res.header('Cache-Control','no-cache');

    //     req.session.destroy((err) => {
    //         if(err){
    //             return console.log(err)
    //         }
    //         res.redirect('./')
    //     })
    // } 
});

app.get('/confirm', (req, res)=>{
    res.render('confirm')
})

app.get('/events',(req, res)=>{
    try{
        db.query(' Select userdetails.Name, eventsDetails.E_ID, eventsDetails.OrganizationName, eventsDetails.Provience, eventsDetails.District, eventsDetails.Municipality, eventsDetails.Date_time, eventsDetails.Contact, eventsDetails.Email, eventsDetails.U_ID From userdetails inner join eventsdetails on userdetails.ID = eventsdetails.U_ID', async(err, result)=>{
            if(err){
                console.log("falied" + err)
            }
            var E_data = {};
            for(var i =0; i<result.length; i++){
                // console.log(result[i].ID)
                E_data[result[i].E_ID] = await[{
                    name: result[i].Name,
                        orgname : result[i].OrganizationName,
                provience : result[i].Provience,
                district: result[i].District,
                municipality: result[i].Municipality,
                date : result[i].Date_time,
                contact: result[i].Contact,
                email: result[i].Email,
                
               
                }]
                
            }
            console.log(E_data);
            return res.render('events', {result:E_data})

            
            
        })
        app.post('/eventsearch',(req, res)=>{
            const prov = req.body.subject;
            const dist = req.body.topic;
            const mun = req.body.chapter;
            console.log(prov, dist, mun)

            db.query("Select userdetails.Name, eventsDetails.E_ID, eventsDetails.OrganizationName, eventsDetails.Provience, eventsDetails.District, eventsDetails.Municipality, eventsDetails.Date_time, eventsDetails.Contact, eventsDetails.Email, eventsDetails.U_ID From userdetails inner join eventsdetails on userdetails.ID = eventsdetails.U_ID WHERE eventsDetails.Provience =? AND eventsDetails.District=? AND eventsDetails.Municipality=? ",[prov, dist, mun],async(err, results)=>{
                 if(err){
            console.log("falied" + err)
        }
                console.log(results)
                var E_data = {};
                for(var i =0; i<results.length; i++){
                    // console.log(result[i].ID)
                    E_data[results[i].E_ID] = await[{
                        name: results[i].Name,
                            orgname : results[i].OrganizationName,
                    provience : results[i].Provience,
                    district: results[i].District,
                    municipality: results[i].Municipality,
                    date : results[i].Date_time,
                    contact: results[i].Contact,
                    email: results[i].Email,
                    
                   
                    }]
                    
                }
                return res.render('events', {result:E_data})
            })

        })
    }
    catch{
        console.log(err)
    }

})

app.get('/requestinfo',(req, res)=>{
    return res.render('requestinfo')
})





// app.get("/home", function(req, res){
//     console.log("enter home")
//     res.render('index2')
// })s
app.get('/adminLogin', (req, res)=>{
  return res.render('adminLogin')
})




app.use('/', require('./routes/pages')) //routers to /
app.use('/loginregister', require('./routes/pages')) // if /loginregister is provided go to routes -> pages and render loginregister
app.use('/auth', require('./routes/auth'))
// app.use('/Reotp', require('./routes/auth')) //first resend otp, register garda ko
// app.use('/LoginOtp',require('./routes/pages'))
// app.use('/resend',require('./routes/auth'))
app.use('/reOtpVerification', require('./routes/pages'))
app.use('/userpage', require('./routes/pages'))
app.use('/request', require('./routes/pages'))
app.use('/search', require('./routes/pages'))
app.use('/checkid',require('./routes/pages'))
app.use('/received', require('./routes/pages'))
app.use('/addEvents', require('./routes/pages'))
app.use('/otpVerification', require('./routes/pages'))

app.use('/adminpage', require('./routes/pages'))
app.use('/adminevents',require('./routes/pages'))

app.use('/donorhistory:id',require('./routes/pages'))
app.use('/deleteuser:id',require('./routes/pages'))
app.use('/edituser:id', require('./routes/pages'))
app.use('/deletehistory:id',require('./routes/pages'))
app.use('/edithistory:id', require('./routes/pages'))
app.use('/editevent:id', require('./routes/pages'))
app.use('/deleteevents:id',require('./routes/pages'))

app.use('/edit',require('./routes/pages'))
app.use("/adminsearch",require('./routes/pages'))

app.use('/donorhistory',require('./routes/pages'))
app.use('/changestatus',require('./routes/pages'))

app.use('/forgetpassword',require('./routes/pages'))
app.use('/forgetpwd', require('./routes/pages'))
app.use('/fotpVerification', require('./routes/pages'))
app.use('/changepwd', require('./routes/pages'))
// app.use('/pages', require('./routes/pages'))

app.listen(8000, ()=>{
    console.log('server started')
})