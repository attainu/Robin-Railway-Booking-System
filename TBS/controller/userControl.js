import User from "../models/User"
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
                message:"invalid train number",
                info:err
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
                            pass:'********'   ///add your email and password here
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

//user can update his booking

exports.updateBooking = function(req,res){
    ticket.updateOne({pnrNumber:req.body.pnrNumber},{$set:{dateofjourney:req.body.dateofjourney}}).then(()=>{
        res.json({
            message:"ticket details updated"
        })
    })
}

//cancel existing ticket

exports.cancelTicket = function(req,res){
    ticket.deleteOne({pnrNumber:req.body.pnrNumber}).then(()=>{
        res.json({
            message:"Your ticket is canceled of pnr Number: "+req.body.pnrNumber
        })
    })
}


//USER CAN GET THE TRAIN DETAILS BY TRAIN NUMBER

exports.searchByNumber = function(req,res){
    let query= trainData.findOne({trainNumber:req.body.trainNumber})
    query.exec(function(err,data){
        if(err){
            res.json({
                message:"Failed to get data Please check The Search Parameters",
                error:err
            })
        }
        else{
            res.json({
                message:'Results For Your Search',
                info:data
            })
        }
    })

}

//get all trains details in alphabetical order

exports.data = function(req,res){
    let query = trainData.find()
    query.sort({trainName:1})
    .limit(5)
    .exec(function(err,result){
        if(err){
            res.json({
                message:"Failed To Get Data",
                info:err
            })
        }
        else{
            res.json({
                message:"Good Morning These Trains Are Scheduled As Of Now",
                info:result
            })
        }
    })
}