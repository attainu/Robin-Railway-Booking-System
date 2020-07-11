import User from "../models/User"
import jwt from "jsonwebtoken"
import config from "../config/database"
import ticket from "../models/booking"
import trainData from "../models/trainModel"
import nodemailer from "nodemailer"
import seat from "../helpers/seat"
import pnr from "../helpers/pnr"
import fs from "fs"

const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: "dp8vvueya",
    api_key: "925896488712235",
    api_secret: "SaPAKX3hQUjFVrq79o6t-VC2tuA"
});


//new user registeration

exports.addUser = (req,res)=>{
    let newUser = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        contact: req.body.contact,
        password: req.body.password
    });
    if(req.body.username==null){
        res.json({message:'username is required'})
    }
    if(req.body.password==null){
        res.json({message:'password is required'})
    }
    else{
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
    
}

//user login

exports.userLogin = (req,res)=>{
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
                    success: false,
                    message: "Wrong Password."
                })
            }
        })
    })
}

//userprofile

exports.userDashboard = (req,res)=>{
    return res.json({
        message:`welcome ${req.user.name}`,
        info:req.user
    })
}

//new booking
exports.bookTicket = async (req,res)=>{
    const url= await cloudinary.uploader.upload(req.file.path)
    let book = new ticket({
        passengername:req.user.name,
        email:req.user.email,
        trainNumber:req.body.trainNumber,
        pnrNumber:pnr,
        dateofjourney:req.body.dateofjourney,
        seatNumber:seat,
        status:req.body.status,
        aadharimage:url.url
    })
    fs.unlinkSync(req.file.path)
    if(req.body.trainNumber==null){
        res.json({
            message:'fields required'
        })
    }
    if(req.body.dateofjourney==null){
        res.json({
            message:'fields required'
        })
    }
    else{
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
                    res.json({
                        message:'unable to book',
                        info:err
                    })
                }
                else{

                    var transporter = nodemailer.createTransport({
                        service:'gmail',
                        auth:{
                            user:'attainutbs@gmail.com',
                            pass:'tbsattainu'   
                        }
                    });
                    var mailOptions = {
                        from:'attainutbs@gmail.com',
                        to:req.user.email,
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

    
 
}


//user can search his ticket by using pnr number
exports.byPnr = (req,res)=>{
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

exports.updateBooking = (req,res)=>{
    ticket.updateOne({pnrNumber:req.body.pnrNumber},{$set:{dateofjourney:req.body.dateofjourney}}).then(()=>{

        
        res.json({
            message:"ticket details updated"
        })
    })
}

//cancel existing ticket

exports.cancelTicket = (req,res)=>{
    ticket.deleteOne({pnrNumber:req.body.pnrNumber}).then(()=>{
        res.json({
            message:"Your ticket is canceled of pnr Number: "+req.body.pnrNumber
        })
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
                message:"These Trains Are Scheduled As Of Now",
                info:result
            })
        }
    })
}


// to know the trains between two stations
exports.stations = (req,res)=>{

    trainData.find({origin:req.body.origin,destination:req.body.destination},(err,docs)=>{
        if(err){
            res.json({
                message:'failed to get train data',
                info:err
            })
        }

        else{
            res.json({
                message: `Trains Between ${req.body.origin} and ${req.body.destination}`,
                info:docs
            })
        }
    })
}


//user can see all his bookings

exports.bookings =(req,res)=>{
    let query= ticket.find({email:req.user.email})
    query.exec(function(err,result){
        if(err){
            res.json({
                message:'failed to get data',
                info:err
            })
        }
        else{
            res.json({
                message:'Your Bookings',
                info:result
            })
        }

    })
}

exports.getByEmail =(req,res)=>{

    let query = ticket.findOne({pnrNumber:req.body.pnrNumber})
    query.exec(function(err,tickt){
        if(err){
            res.json({
                message:'PNR NOT FOUND'
            })
        }
        else{

            var transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:'attainutbs@gmail.com',
                    pass:'tbsattainu'   
                }
            });
            var mailOptions = {
                from:'attainutbs@gmail.com',
                to:req.user.email,
                subject:'TICKET DETAILS',
                text:JSON.stringify(tickt)
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
                message:'YOUR TICKET DETAILS SENT TO MAIL'
            })
        }
    })

}