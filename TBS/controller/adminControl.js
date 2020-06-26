import trainData from "../models/trainModel"
import Admin from "../models/Admin"
import passport from "passport"
import jwt from "jsonwebtoken"
import config from "../config/database"
import noOfSeats from "../helpers/deleteSeat"
import ticket from "../models/booking"



//adding a new admin
exports.newAdmin = function(req,res){
    let newAdmin = new Admin({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        contact: req.body.contact,
        password: req.body.password,
        job_profile: req.body.job_profile
    });
    Admin.addAdmin(newAdmin, (err, user) => {
        if (err) {
            let message = "";
            if (err.errors.username) message = "Username is already taken. ";
            if (err.errors.email) message += "Email already exists.";
            return res.json({
                success: false,
                message
            });
        } else {
            return res.json({
                success: true,
                message: "Admin registration is successful."
            });
        }
    });
    

}

//admin login
exports.login = function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    Admin.getAdminByUsername(username, (err, admin) => {
        if (err) throw err;
        if (!admin) {
            return res.json({
                success: false,
                message: "Admin not found."
            });
        }

        Admin.comparePassword(password, admin.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign({
                    type: "admin",
                    data: {
                        _id: admin._id,
                        username: admin.username,
                        name: admin.name,
                        email: admin.email,
                        contact: admin.contact,
                        job_profile: admin.job_profile
                    }
                }, config.secret, {
                    expiresIn: 604800 // for 1 week time in milliseconds
                });
                return res.json({
                    success: true,
                    token: "JWT " + token
                });
            } else {
                return res.json({
                    success: true,
                    message: "Wrong Password."
                });
            }
        });
    });
}

//admin profile
exports.adminDashboard = function(req,res){
    return res.json({
        message:'ADMIN PROFILE',
        info:req.user
    })
}

//add a new train
exports.addTrain = function(req,res){
    let entry = new trainData({
        trainName:req.body.trainName,
        origin:req.body.origin,
        destination:req.body.destination,
        travelDistance:req.body.travelDistance,
        arrival:req.body.arrival,
        departure:req.body.departure,
        vacantSeats:noOfSeats,
        trainNumber:req.body.trainNumber,
        class:req.body.class,
        pricePerKm:req.body.pricePerKm,
        totalFare:(req.body.travelDistance)*(req.body.pricePerKm)

    })

    entry.save(function(err,saved){
        if(err){
            res.json({
                message:"Failed To Add Train",
                info:err
            })
        }
        else{
            res.json({
                message:'New Train Schedule Added',
                info:saved
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
                message:"Below Are The Scheduled Trains",
                info:result
            })
        }
    })
}

//update details of specific train
exports.update = function(req,res){
    trainData.updateOne({trainNumber:req.body.trainNumber}, {$set:{arrival:req.body.arrival,departure:req.body.departure}}).then(()=>{
        res.json({
            message:'Train Details Updated'
        })
    })
}

//delete train

exports.delete = function(req,res){
    trainData.deleteOne({trainNumber:req.body.trainNumber}).then(()=>{
        res.json({
            message:"deleted succesfully"
        })
    })
}

//admin cancels tickets of cancelled trains

exports.cancelticket = function(req,res){
    ticket.deleteMany({trainNumber:req.body.trainNumber}).then(()=>{
        res.json({
            message:'tickets cancelled'
        })
    })
}