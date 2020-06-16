import express from "express"
const router = express.Router();
import passport from "passport"
import userControl from "../controller/userControl"




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

router.post('/book',passport.authenticate('jwt',{
    session:false
}),(req,res)=>{
    return userControl.bookTicket(req,res)
})

router.get('/pnr',passport.authenticate('jwt',{
    session:false
}),(req,res)=>{
    return userControl.byPnr(req,res)
})
module.exports = router;