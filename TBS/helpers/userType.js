import chalk from "chalk"
import passport from "passport"
// middleware for checking user type
const checkUserType = function (req, res, next) {
    //second index of the array contains the user type
    const userType = req.originalUrl.split('/')[2];
    console.log(chalk.bold.bgCyan(`ROLE OF PERSON USING APP ${userType}`))
    //passport authentication starategy
    require('../config/passport')(userType, passport);
    next();
};

module.exports = checkUserType