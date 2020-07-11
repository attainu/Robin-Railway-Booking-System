import express from "express"
const router = express.Router();
import passport from "passport"
import userControl from "../controller/userControl"
import uploads from "../helpers/imageupload"




router.post('/register',(req,res)=>{
    return userControl.addUser(req,res)

})

router.post('/login',(req,res)=>{
    return userControl.userLogin(req,res)
})

router.get('/profile',passport.authenticate('jwt',{
    session:false
}),(req,res)=>{
    return userControl.userDashboard(req,res)
})

router.post('/book',uploads.uploads.single("idProof"),passport.authenticate('jwt',{
    session:false
}),(req,res)=>{
    return userControl.bookTicket(req,res)
})

router.get('/pnr',passport.authenticate('jwt',{
    session:false
}),(req,res)=>{
    return userControl.byPnr(req,res)
})

router.put('/update',passport.authenticate('jwt',{
    session:false
}),(req,res)=>{
    return userControl.updateBooking(req,res)
})

router.delete('/cancel',passport.authenticate('jwt',{
    session:false
}),(req,res)=>{
    return userControl.cancelTicket(req,res)
})


router.get('/alltrains',passport.authenticate('jwt',{
    session:false
}),(req,res)=>{
    return userControl.data(req,res)
})

router.get('/station',(req,res)=>{
    return userControl.stations(req,res)
})

router.get('/mybookings',passport.authenticate('jwt',{
    session:false

}),(req,res)=>{
    return userControl.bookings(req,res)
})

router.get('/email',passport.authenticate('jwt',{
    session:false
}),(req,res)=>{
    return userControl.getByEmail(req,res)
})
module.exports = router;