const homePage = async (req, res, next) => {
    //const curr= currentUser._id;
    try {
        res.render('home');  
    } catch (error) {
        next(error);  
    }
};

module.exports = { homePage };