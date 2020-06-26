import express from "express"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import cors from "cors"
import config from './config/database'
import passport from "passport"
import chalk from 'chalk'
import morgan from "morgan"
import users from "./routes/users"
import admin from "./routes/admin"
import checkUserType from "./helpers/userType"
import path from "path"





// Connect with the database
mongoose.connect(config.database, {
        useNewUrlParser: true,
        useUnifiedTopology:true,
        useCreateIndex:true
    })
    .then(() => {
        console.log(chalk.bold.dim('Databse connected successfully ' + config.database));
    }).catch(err => {
        console.log(err);
    });

    
// Initialize the app
const app = express();

// Defining the Middlewares
app.use(cors());
app.use(morgan('tiny'))

// BodyParser Middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}))
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());



//middleware for checking user
app.use(checkUserType);

//setting views directory for views.
app.set("views", path.join(__dirname, "views")); 
//setting view engine as handlebars
app.set("view engine", "hbs"); 


//image upload

app.use(express.static(path.join(__dirname, "uploads")));

//index route for views
app.get('/',(req,res)=>{
    res.render('index',{title:'RAILWAY BOOKING SYSTEM'})
})
//user route
app.use('/api/users', users);

//admin route
app.use('/api/admin', admin);

// Defining the PORT
const PORT = process.env.PORT || 5000;

//host connection
app.listen(PORT, () => {
    console.log(chalk.bold.bgMagenta(`Server started on port ${PORT}`));
});