const Passport= require('passport');
const LocalStrategy= require('passport-local');
const User= require('../schemas/user');


const isLoggedIn= function(req,res,next){
    if(!req.isAuthenticated()){
        return res.redirect('/user/login');
    }
    next();
}

module.exports={isLoggedIn};

