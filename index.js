const express= require('express');
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const port = 3000;
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
// const flash = require('connect-flash');
// const session = require('express-session');
// const sessionOptions = {secret: "this is a secret", resave: false};
// app.use(session(sessionOptions));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.static(path.join(__dirname,'/public')));
// app.use(flash());
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
const fromemail='nagateja590@gmail.com';
const password = 'pujjfzoarsmooprx';
const dbenv = "mongodb+srv://Nagateja12:Naga2402.@startupdb.oqxkpce.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(dbenv||"mongodb://localhost:27017/startupDB", {useNewUrlParser: true});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// database connect
mongoose.connect(dbenv, {useNewUrlParser: true});

const StudentsignupSchema = {
    name: String,
    email: String,
    password: String,
    isVerified: {type: String, default: false}
};
const InvestorsignupSchema = {
  name: String,
  email: String,
  password: String,
  company: String,
  isVerified: {type: String, default: false}
};  
const ProjectSchema ={
  email: String,
  PName: String,
  Description: String,
  GLink: String,
  NoLikes: String
}
const otpSchema = {
    otp: String,
    email: String
};

  const studentsignup = mongoose.model("StudentSignup",StudentsignupSchema);
  const investorsignup = mongoose.model("InvestorSignup",InvestorsignupSchema);
  const otps = mongoose.model("otp", otpSchema);
  const Project = mongoose.model("Project",ProjectSchema);


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// project add
app.get('/project/add',(req,res)=>{
  res.render('project-add');
})
app.post('/project/add',(req,res)=>{
  const email = req.body.email;
  if(studentsignup.findOne({email: email})){
    var newproject = new Project;
    newproject.PName = req.body.projectname;
    newproject.Description = req.body.description;
    newproject.email = req.body.email;
    newproject.GLink = req.body.glink;
    newproject.NoLikes = '0';
    newproject.save((err,data)=>{
      if(err) throw err;
      else console.log('data inserted');
      res.redirect('/');
    })
  }
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// collab

app.get('/collab',(req,res)=>{
  Project.find({},(err,data)=>{
      if(err) throw err;
      else{
        console.log(data)
        res.render('project',{data});
      }
  })
})






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Authentication and signup
//  sent otp
// var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: fromemail,
    pass: password
  }
});



// reset password
// Student
// _________________________________________________________________________________
app.get('/reset-password-student',(req,res)=>{
  res.render('Student-Registration/reset');
})

app.post('/reset-password-student',(req,res)=>{
    const email = req.body.email;
    studentsignup.findOne({email: email},(err,data)=>{
      if(err){
        res.redirect('/signup-student');
      }else{
        var otp1 = Math.floor(Math.random()*1000000);
        var newotp = new otps;
        newotp.otp = otp1;
        newotp.email = email;
        newotp.save((err,data)=>{
          if(err)throw err;
          else console.log('otp inserted');
        })
        res.redirect(`/otp-verify-student/${email}`);
      }
    })
})

app.get('/otp-verify-student/:email',(req,res)=>{
  const {email} = req.params;
  otps.findOne({email: `${email}`},(err,data)=>{
    if(err)throw err;
    else{
          var mailOptions = {
            from: fromemail,
            to: email,
            subject: 'Reset password',
            text: `This is the new otp to reset password, the otp is ${data.otp}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          res.render('Student-Registration/otp-verify',{data});
        
      
      
      
    }
  })
})

app.post('/otp-verify-student',(req,res)=>{
  const otpentered = req.body.otp;
  const email = req.body.email;
  otps.findOne({email: `${email}`},(err,data)=>{
    if(err) throw err;
    else{
      if(otpentered!=data.otp){
        res.redirect('/reset-password-student');
      }else{
        studentsignup.findOneAndUpdate({email: `${email}`},{password: req.body.newpass},(err)=>{
          if(err) throw err;
          else{
              console.log("new password updated")
          }
        });
        otps.findOneAndDelete({email: `${email}`},(err)=>{
          if(err) throw err;
          else{
            console.log("otp deleted")
          }
        });
        res.redirect('/signin-student');
      }
    }
  })
  
  
})

// Investor
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/reset-password-investor',(req,res)=>{
  res.render('Investor-Registration/reset');
})

app.post('/reset-password-investor',(req,res)=>{
  const email = req.body.email;
  investorsignup.findOne({email: email},(err,data)=>{
    if(err){
      res.redirect('/signup-investor');
    }else{
      var otp1 = Math.floor(Math.random()*1000000);
      var newotp = new otps;
      newotp.otp = otp1;
      newotp.email = email;
      newotp.save((err,data)=>{
        if(err)throw err;
        else console.log('otp inserted');
      })
      res.redirect(`/otp-verify-investor/${email}`);
    }
  })
})

app.get('/otp-verify-investor/:email',(req,res)=>{
  const {email} = req.params;
  otps.findOne({email: `${email}`},(err,data)=>{
    if(err)throw err;
    else{
          var mailOptions = {
            from: fromemail,
            to: email,
            subject: 'Reset password',
            text: `This is the new otp to reset password, the otp is ${data.otp}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          res.render('Student-Registration/otp-verify',{data});
        
      
      
      
    }
  })
})
app.post('/otp-verify-investor',(req,res)=>{
  const otpentered = req.body.otp;
  const email = req.body.email;
  otps.findOne({email: `${email}`},(err,data)=>{
    if(err) throw err;
    else{
      if(otpentered!=data.otp){
        res.redirect('/reset-password-investor');
      }else{
        investorsignup.findOneAndUpdate({email: `${email}`},{password: req.body.newpass},(err)=>{
          if(err) throw err;
          else{
              console.log("new password updated")
          }
        });
        otps.findOneAndDelete({email: `${email}`},(err)=>{
          if(err) throw err;
          else{
            console.log("otp deleted")
          }
        });
        res.redirect('/signin-investor');
      }
    }
  })
  
  
})

// Signup
// student
// -----------------------------------------------------------------------

// app.use((req,res,next)=>{
//   res.locals.messages = req.flash('error');
//   next();
// })

app.get('/signup-student',(req,res)=>{
    res.render('Student-Registration/signup');
})

app.post('/signup-student',(req,res)=>{
    var newsignup = new studentsignup;
    newsignup.name = req.body.fullname;
    newsignup.email = req.body.email;
    
    newsignup.password = req.body.password;
    if(req.body.password!=req.body.confirm){
      // req.flash('error','Please confirm password'); 
      res.redirect('/signup-student');
        
    }
    newsignup.save((err,data)=>{
        if(err) throw err;
        else
        console.log("data inserted!!");
    })

    res.redirect(`/`);
})
 
// signin
// --------------------------------------------------------------------------
app.get('/signin-student',(req,res)=>{
    res.render('Student-Registration/signin');
})
app.post('/signin-student',(req,res)=>{
    studentsignup.findOne({email: req.body.email},(err,data)=>{
        if(err) throw err;
        else{
            if(data.password!=req.body.password){
                res.redirect('/signin');
                res.send('incorect password');
            }
            else
                res.redirect('/');
        }
    })
})


// Investor
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/signup-investor',(req,res)=>{
  res.render('Investor-Registration/signup');
})

app.post('/signup-investor',(req,res)=>{
  var newsignup = new investorsignup;
  newsignup.name = req.body.fullname;
  newsignup.email = req.body.email;
  newsignup.company = req.body.company;
  newsignup.password = req.body.password;
  if(req.body.password!=req.body.confirm){
      res.redirect('/signup-investor');
  }
  newsignup.save((err,data)=>{
      if(err) throw err;
      else
      console.log("data inserted!!");
  })

  res.redirect('/')
})

// signin
// --------------------------------------------------------------------------
app.get('/signin-investor',(req,res)=>{
  res.render('Investor-Registration/signup');
})
app.post('/signin-investor',(req,res)=>{
  investorsignup.findOne({email: req.body.email},(err,data)=>{
      if(err) throw err;
      else{
          if(data.password!=req.body.password){
              res.redirect('/signup');
          }
          else
              res.redirect('/');
      }
  })
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////
// verification
// Student
app.get('/verify-student',(req,res)=>{
  res.render('Student-Registration/verify-email');
})
app.post('/verify-student',(req,res)=>{
  const email = req.body.email;
    studentsignup.findOne({email: email},(err,data)=>{
      if(err){
        res.redirect('/signup-student');
      }else{
        var otp1 = Math.floor(Math.random()*1000000);
        var newotp = new otps;
        newotp.otp = otp1;
        newotp.email = email;
        newotp.save((err,data)=>{
          if(err)throw err;
          else console.log('otp inserted');
        })
        res.redirect(`/otp-verify-email-student/${email}`);
      }
    })
})
app.get('/otp-verify-email-student/:email',(req,res)=>{
  const {email} = req.params;
  otps.findOne({email: `${email}`},(err,data)=>{
    if(err)throw err;
    else{
          var mailOptions = {
            from: fromemail,
            to: email,
            subject: 'Verify your Email',
            text: `This is the new otp to verify your email, the otp is ${data.otp}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          res.render('Student-Registration/otp-email-verify',{data});
        
      
      
      
    }
  })
})

app.post('/otp-email-verify-student',(req,res)=>{
  const otpentered = req.body.otp;
  const email = req.body.email;
  otps.findOne({email: `${email}`},(err,data)=>{
    if(err) throw err;
    else{
      if(otpentered!=data.otp){
        res.redirect(`/otp-email-verify-student/${email}`);
      }else{
        studentsignup.findOneAndUpdate({email: `${email}`},{isVerified: true},(err)=>{
          if(err) throw err;
          else{
              console.log("Email verified")
          }
        });
        otps.findOneAndDelete({email: `${email}`},(err)=>{
          if(err) throw err;
          else{
            console.log("otp deleted")
          }
        });
        res.redirect('/');
      }
    }
  })
  
  
})



// investor
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/verify-investor',(req,res)=>{
  res.render('Investor-Registration/verify-email');
})
app.post('/verify-investor',(req,res)=>{
  const email = req.body.email;
    investorsignup.findOne({email: email},(err,data)=>{
      if(err){
        res.redirect('/signup-investor');
      }else{
        var otp1 = Math.floor(Math.random()*1000000);
        var newotp = new otps;
        newotp.otp = otp1;
        newotp.email = email;
        newotp.save((err,data)=>{
          if(err)throw err;
          else console.log('otp inserted');
        })
        res.redirect(`/otp-verify-email-investor/${email}`);
      }
    })
})
app.get('/otp-verify-email-investor/:email',(req,res)=>{
  const {email} = req.params;
  otps.findOne({email: `${email}`},(err,data)=>{
    if(err)throw err;
    else{
          var mailOptions = {
            from: fromemail,
            to: email,
            subject: 'Verify your Email',
            text: `This is the new otp to verify your email, the otp is ${data.otp}`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          res.render('Investor-Registration/otp-email-verify',{data});
        
      
      
      
    }
  })
})

app.post('/otp-email-verify-investor',(req,res)=>{
  const otpentered = req.body.otp;
  const email = req.body.email;
  otps.findOne({email: `${email}`},(err,data)=>{
    if(err) throw err;
    else{
      if(otpentered!=data.otp){
        res.redirect(`/otp-email-verify-investor/${email}`);
      }else{
        studentsignup.findOneAndUpdate({email: `${email}`},{isVerified: true},(err)=>{
          if(err) throw err;
          else{
              console.log("Email verified")
          }
        });
        otps.findOneAndDelete({email: `${email}`},(err)=>{
          if(err) throw err;
          else{
            console.log("otp deleted")
          }
        });
        res.redirect('/');
      }
    }
  })
  
  
})







////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/',(req,res)=>{
  res.render('home')
})

app.listen(process.env.PORT||port,()=>{
    console.log(`server is running at ${port}`)
})