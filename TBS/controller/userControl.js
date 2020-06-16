import User from "../models/User"
import passport from "passport"
import jwt from "jsonwebtoken"
import config from "../config/database"
import ticket from "../models/booking"
import trainData from "../models/trainModel"
import nodemailer from "nodemailer"
import seat from "../helpers/seat"
import pnr from "../helpers/pnr"


//new user registeration

exports.addUser = function(req,res){
    let newUser = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        contact: req.body.contact,
        password: req.body.password
    });
    User.addUser(newUser, (err, user) => {
        if (err) {
            let message = "";
            if (err.errors.username) message = "Username is already taken. ";
            if (err.errors.email) message += "Email already exists.";
            return res.json({
                success: false,
                message
            })
        } else {
            return res.json({
                success: true,
                message: "User registration is successful."
            })
        }
    })
}

//user login

exports.userLogin = function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({
                success: false,
                message: "User not found."
            })
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign({
                    type: "user",
                    data: {
                        _id: user._id,
                        username: user.username,
                        name: user.name,
                        email: user.email,
                        contact: user.contact
                    }
                }, config.secret, {
                    expiresIn: 604800 // for 1 week time in milliseconds
                })
                return res.json({
                    success: true,
                    token: "JWT " + token
                })
            } else {
                return res.json({
                    success: true,
                    message: "Wrong Password."
                })
            }
        })
    })
}

//userDashboard

exports.userDashboard = function(req,res){
    return res.send(req.user)
}

//new booking
exports.bookTicket = function(req,res){
    let book = new ticket({
        passengername:req.user.name,
        email:req.user.email,
        trainNumber:req.body.trainNumber,
        pnrNumber:pnr,
        dateofjourney:req.body.dateofjourney,
        seatNumber:seat,
        status:req.body.status
    })

    let query =trainData.findOne({trainNumber:req.body.trainNumber})
    query.exec(function(err,found){
        if(err){
            res.json({
                message:"invalid train number"
            })
        }

        if(found){
            book.save(function(err,saved){
                if(err){
                    res.send("unable to book"+err)
                }
                else{
                    var transporter = nodemailer.createTransport({
                        service:'gmail',
                        auth:{
                            user:'kalyan15meka@gmail.com',
                            pass:'********'
                        }
                    });
                    var mailOptions = {
                        from:'kalyan15meka@gmail.com',
                        to:'kalusai392@gmail.com',
                        subject:'BOOKING CONFIRMATION',
                        text:JSON.stringify(saved)
                    };
                    transporter.sendMail(mailOptions,function(error,info){
                        if(error){
                            console.log(error)
                        }
                        else{
                            console.log("email sent"+info.response)
                        }
                    })


                    res.json({
                        message:"succesful",
                        ticket:saved
                    })
                }
            })
        }
    })

 
}

//user can search his ticket by using pnr number
exports.byPnr = function(req,res){
    let query = ticket.findOne({pnrNumber:req.body.pnrNumber})
    query.exec(function(err,tickt){
        if(err){
            res.json({
                message:'PNR NOT FOUND'
            })
        }
        else{
            res.json({
                message:'YOUR TICKET DETAILS',
                ticket:tickt
            })
        }
    })
}



