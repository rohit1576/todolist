var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var FB = require('fbgraphapi');
var request = require('request');
var methodOverride = require('method-override');
var app = express();
app.use(methodOverride("_method"));


var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/todolist2",{useMongoClient: true});

//mongoose.connect("mongodb://rohitsuri:password@ds149353.mlab.com:49353/todolist",{useMongoClient: true});


//USER AUTHENTICATION USING PASSPORT-FACEBOOK

passport.use(new Strategy({
    clientID: 'not for sharing' ,
    clientSecret: 'not for sharing' ,
    callbackURL: 'http://localhost:3000/login/facebook/return'
  },
  function(accessToken, refreshToken, profile, cb) {
    
    return cb(null, profile);
  }));

//SERIALIZE USER

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

//DESERIALIZE USER

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});





// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(require('body-parser').urlencoded({ extended: true }));

//USING EXPRESS SESSION SO THAT USER REMAINS LOGGED IN EVEN IF PAGE REFRESHES OR UNTILL USER EXPLICITLY LOGS OUT

app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

var todoSchema = new mongoose.Schema({
	task : String
});

var Todo =mongoose.model("Todo",todoSchema);

var userSchema = new mongoose.Schema({
	facebookid: Number,
	name: String,
	todo:[
	{
		type : mongoose.Schema.Types.ObjectId,
		ref: "Todo"
	}
	]
});
var User =mongoose.model("User",userSchema);



// Define routes.

app.get('/login',
  function(req, res){
    res.redirect('/login/facebook');
  });

app.get('/login/facebook',
  passport.authenticate('facebook'));



app.get('/login/facebook/return', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {

  	User.find({facebookid:req.user.id},function(err,found){
  		if(found.length){
  			console.log('user exists!');

  		}
  		else
  		{
  			User.create({
  			name: req.user.displayName,
  			facebookid: req.user.id
  		    },function(err,created){
  			if(err)
  				{console.log(err);}
  			else
  			{
  				console.log("new user");
  			}

  		})
  		}
  	});

  	//console.log(req.user);
    res.redirect('/');
    
  });


  
 app.get("/logout",function(req, res) {

    req.logout();
    res.redirect("/");
});

//MIDDLEWARE TO CHECK WHETHER USER IS LOGGED IN
//IT WILL BE USED SO THAT USER CAN'T ACCESS /show ROUTE EXPLICITLY WHEN NOT LOGGED IN

 function isLoggedIn(req,res,next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    res.redirect("/login");
}

//SENDING INFORMATION TO ALL THE TEMPLATES REGARDING THE CURRENT LOGGED IN USER
app.use(function(req,res,next){
res.locals.currentUser = req.user;
next();
});

//var User = require(user.js);


app.get('/',
  function(req, res) {
  	if(req.user){
  		User.findOne({facebookid:req.user.id},function(err,found){
  			if(err)
  				{console.log(err);}
  			else
  			{
  				//console.log('USER FOUND ON / ROUTE ' + found);
  				//console.log(req.user);
  				res.render('home',{currentUser: found});
  			}
  		});
  		
  	}
  	else
  	{
  		res.render('home',{currentUser: req.user});
  	}
  	
    
  });



app.get('/:id/todo',isLoggedIn,function(req,res){

	User.findById(req.params.id).populate("todo").exec(function(err,found){
		if(err)
			{console.log('err');
			}
		else
		{
			
			res.render("todo",{user:found});

		}
	});
});

app.get('/:id/todo2',isLoggedIn,function(req,res){

	User.findById(req.params.id).populate("todo").exec(function(err,found){
		if(err)
			{console.log('err');
			}
		else
		{
			
			res.send(found.todo);

		}
	});
});

app.post('/:id/todo',isLoggedIn,function(req,res){

	User.findById(req.params.id,function(err,founduser){
		if(err)
		{
			
			console.log('err in app.post');
			console.log(err);
		}
		else
		{
			Todo.create({task:req.body.task},function(err,newtask){
				founduser.todo.push(newtask);
				founduser.save(function(err,data){
					if(err)
					{
						console.log(err);
					}
					else
					{
						
						var url = '/' + req.params.id + '/todo';
						res.redirect(url);
					}
				});
			});

			
		}

	});

});

app.delete('/:id/todo/:task_id',function(req,res){

	Todo.findByIdAndRemove(req.params.task_id,function(err){
		if(err)
		{
			console.log('error');
		}
		else
		{
			
			var url = '/' + req.params.id + '/todo';
			res.redirect(url);
		}

	});
});


app.listen(3000,function(){
	console.log('Server started at 3000');
})
