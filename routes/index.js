var express = require('express');
var router = express.Router();
var Data = require("../model/usermodel.js")
var expensedata = require("../model/expensemidel.js")
const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(Data.authenticate()));
var nodemailer = require("nodemailer")
const multer = require("../utils/multer").single("userimage")
const email = require("../authentication.js")

/* GET home page. */
router.get('/', async function (req, res, next) {
res.render('index',{ admin: req.user});
  
});


router.get('/register', function (req, res, next) {
  res.render('register', {admin: req.user});
});


router.post('/register', async function (req, res, next) {
multer(req, res,async  function(err){
if (err) throw err;

try {
  await Data.register({ username: req.body.username, email: req.body.email, gender: req.body.gender, userimage: req.file.filename, number: req.body.number, address: req.body.address, location: req.body.location}, req.body.password)
  res.redirect("/login")
} catch (err) {
  console.log(err)
  res.send(err)
}

})
 
});


router.get('/login', function (req, res, next) {
  res.render('login', {admin: req.user});
});

router.post('/login', passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/login"
}),
  function (req, res, next) {
  });



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next()
  } else {
    res.redirect("/login")
  }
}


router.get('/forgot', function (req, res, next) {
  res.render('forgot', {admin: req.user});
});


router.post('/forgot', async function (req, res, next) {
  try {
    const user = await Data.findOne({ email: req.body.email })
    if (!user) return res.send("user not found")

    sendMail(req, res, user)
  } catch (err) {
    console.log(err)
    res.send(err)
  }

});


function sendMail(req, res, user) {

  const otp = Math.floor(1000 + Math.random() * 9000)

  // admin mail address, which is going to be the sender
  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: email.gmail,
      pass: email.pass,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    },
  });
  // receiver mailing info
  const mailOptions = {
    from: "Akshita Pvt. Ltd.<akshitadanewala@gmail.com>",
    to: user.email,
    subject: "Testing Mail Service",
    // text: req.body.message,
    html: `<h1>${otp}</h1>`,
  };
  // actual object which intregrate all info and send mail
  transport.sendMail(mailOptions, (err, info) => {
    console.log(err)
    if (err) return res.send(err);
    console.log(info);
    user.forgotpasswordOtp = otp;
    user.save()
    res.render("otp", { email: user.email , admin: req.user})
    // return res.send(
    //   "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
    // );
  })
}


router.get('/matchOtp', function (req, res, next) {
  res.render('matchOtp', {admin: req.user});
});


router.post('/matchOtp/:email', async function (req, res, next) {
  try {
    const matchotp = await Data.findOne({ email: req.params.email })
    if (matchotp.forgotpasswordOtp == req.body.otp) {
      matchotp.forgotpasswordOtp = -1
      await matchotp.save()
      res.render("resetpassword", { id: matchotp._id , admin: req.user})
    } else {
      res.send("Invalid OTP, Try Again <a href='/forgot'>Forgot Password</a>")
    }
  } catch (err) {
    res.send(err)
  }

});



router.post('/resetpassword/:id', async function (req, res, next) {
  try {
    const usernewPassword = await Data.findById(req.params.id)
    await usernewPassword.setPassword(req.body.password)
    await usernewPassword.save()
    res.redirect("/login")
  } catch (err) {
    res.send(err)
  }
});


router.get('/changepassword', function (req, res, next) {
  res.render('changepassword', {admin: req.user});
});


router.post('/changepassword', async function (req, res, next) {
  try {
    await req.user.changePassword(
      req.body.oldpassword,
      req.body.newpassword
    );
    await req.user.save()
    res.redirect('/dashboard');

  } catch (err) {
    res.send(err)
  }
});



router.get('/dashboard', isLoggedIn, async function (req, res, next) {

  try {
    const user = await req.user.populate("expensedata")
    res.render('dashboard', { data: user.expensedata, admin: req.user,email: user.email});
  } catch (err) {
    res.send(err)
  }
});





router.get('/expensesform', async function (req, res, next) {
  res.render('expensesform', {admin: req.user});

});


router.post('/expensesform', async function (req, res, next) {
  try {
    const USER = new expensedata(req.body)
    req.user.expensedata.push(USER._id);
    USER.user = req.user._id
    await USER.save()
    await req.user.save()
    res.redirect("/dashboard")
  } catch (err) {
    res.send(err)
  }

});




router.get('/delete/:id', async function (req, res, next) {
  try {
    const deletedata = req.user.expensedata.findIndex((u) =>
      u._id == req.params.id
    )
    req.user.expensedata.splice(deletedata, 1)
    await req.user.save()
    await expensedata.findByIdAndDelete(req.params.id)
    res.redirect("/dashboard")
  } catch (err) {
    res.send(err)
  }
});


router.get('/editdata/:id', async function (req, res, next) {
  try {
    const editdata = await expensedata.findById(req.params.id)
    res.render('editdata', { edit: editdata });
  } catch (err) {
    res.send(err)
  }
});

router.post('/editdata/:id', async function (req, res, next) {
  try {
    await expensedata.findByIdAndUpdate(req.params.id, req.body)
    res.redirect("/dashboard")
  } catch (err) {
    res.send(err)
  }
});



router.get('/search', function (req, res, next) {
  res.render('search', {admin: req.user});
});



router.get("/logout", isLoggedIn, function (req, res, next) {
  req.logout(() => {
    res.redirect("/login");
  });
});



router.get('/about', isLoggedIn,  async function (req, res, next) {
  res.render('about', {admin: req.user});

});


router.get('/searchexpenses', isLoggedIn,  async function (req, res, next) {
   res.render("searchexpenses", {admin: req.user})
});




// router.post('/search', async function (req, res, next) {
//   try {
//     search = []
//     const data = await req.user.populate("expensedata")
//     const user = data.expensedata
//     user.forEach((e)=>{
//       if(e.category == req.body.search){
//         search.push(e)
//       }
//     })
//     res.render("search" , {search})

//   } catch (err) {
//     res.send(err)
//   }
// });


router.get('/filter',  async function (req, res, next) {
try{
  let{expensedata} = await req.user.populate("expensedata")
  expensedata = expensedata.filter((e)=> e[req.query.key] == req.query.value)
  res.render("search", {admin: req.user, expensedata})

}catch(err){
  res.send(err)
}
});



router.get('/profile/:id', isLoggedIn,  async function (req, res, next) {
  
  try {
    const user = await Data.findById(req.params.id)
    // console.log(user)
    res.render("profile", {user, admin: req.user })
  } catch (error) {
    res.send(error)
  }
});


router.get('/deleteuser/:id', isLoggedIn,  async function (req, res, next) {

  try {
    const del = await Data.findByIdAndDelete(req.params.id)
    del.expensedata.forEach( async(e)=>{
      await expensedata.findByIdAndDelete(e)
    })
    res.redirect("/login")
  } catch (error) {
    console.log(error)
    res.send(error)
  }

});



router.get('/updateuser/:id', isLoggedIn,  async function (req, res, next) {

  res.render("updateuser", {admin: req.user  })
 
});


router.post('/updateuser/:id', isLoggedIn, async function (req, res, next) {
  try{
    let newdata = await  Data.findByIdAndUpdate(req.params.id, { username: req.body.username, email: req.body.email, gender: req.body.gender, userimage: req.body.userimage, number: req.body.number, address: req.body.address, location: req.body.location})
    await newdata.save()
    res.redirect("/dashboard")
  }catch(err){
    console.log(err)

    res.send(err)
  }
});


module.exports = router;
