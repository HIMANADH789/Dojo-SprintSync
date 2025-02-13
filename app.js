const express= require('express');
const mongoose= require('mongoose');
const passport= require('passport');
const localStrategy= require('passport-local');
const path= require('path');
const session= require('express-session');
const User= require('./schemas/user');
const user= require('./routers/user');
const home= require('./routers/home');
//const ejsLayouts= require('express-ejs-layouts');
const methodOverride= require('method-override');
const ejsMate= require('ejs-mate');
const task= require('./routers/task');
const flash= require('connect-flash');

const GroupSubTask= require('./schemas/groupSubTask');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/taskManager');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const app= express();

app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/css',express.static(path.join(__dirname,'node_modules/bootstrap/dist/css')));
app.use('/js',express.static(path.join(__dirname,'node_modules/bootstrap/dist/js')));

app.use(session({
  secret: 'your_secret_key', 
  resave: false,
  saveUninitialized: true,
}));

app.use(flash());
app.use((req,res,next)=>{
  res.locals.success=req.flash('success');
  res.locals.error=req.flash('error');
  next();
})

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());

passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  if (req.user) {
    
    res.locals.currentUserId = req.user._id;
  } else {
    res.locals.currentUserId = null; 
  }
  next();
})

app.use((req, res, next) => {
  if (req.user) {
    req.currentUserId = req.user._id;  // Set currentUserId directly on req object
  }
  next();
});




app.use(express.static(path.join(__dirname,'/public')));
app.use(methodOverride('_method'));


app.use(express.urlencoded({extended:true}));
app.use(express.json());


app.use('/user',user);

app.use('/',home);

app.use('/task',task);


app.listen(3000,()=>{
    console.log('Listening on port 3000');
});

