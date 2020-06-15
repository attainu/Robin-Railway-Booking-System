import trainData from "../models/trainModel"
import Admin from "../models/Admin"
import passport from "passport"
import jwt from "jsonwebtoken"
import config from "../config/database"


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
    return res.send(req.user)
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
        availableDays:req.body.availableDays,
        trainNumber:req.body.trainNumber,
        class:req.body.class,
        price:(req.body.price)*(req.body.travelDistance)

    })

    entry.save(function(err,saved){
        if(err){
            res.send(`error occured here while saving data : ${err}`)
        }
        else{
            res.send(`NEW TRAIN DETAILS ADDED SUCCESFULLY`)
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
            res.send(err)
        }
        else{
            res.send("TRAINS SCHEDULED :"+result)
        }
    })
}

//update details of specific train

exports.update = function(req,res){
    trainData.updateOne({trainName:req.body.trainName},{$set:{origin:req.body.origin,
        destination:req.body.destination,
        travelDistance:req.body.travelDistance,
        arrival:req.body.arrival,
        availableDays:req.body.availableDays,
        departure:req.body.departure}}).then(()=>{
            res.send(`${req.body.trainName} details updated`)
        }).catch(()=>{
            res.send("failed to update train details")
        })
}

//delete train 
exports.delete = function(req,res){
    trainData.deleteOne({trainName:req.body.trainName}).then(()=>{
        res.send(`${req.body.trainName} is cancelled `)
    })

}