import mongoose from "mongoose"
import uniqueValidator from "mongoose-unique-validator"

const schema = mongoose.Schema

const bookingSchema = new schema({
    passengername:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true

    },

    trainNumber:{
        type:String,
        required:true
    },
    pnrNumber:{
        type:String,
        unique:true
    },
    dateofjourney:{
        type:String,
        required:true
    },
    seatNumber:{
        type:Number,
        unique:true,
        required:true
    },
    aadharimage:{
        type:String,
        required:true
    }
    
})

bookingSchema.plugin(uniqueValidator)


module.exports = mongoose.model('booking',bookingSchema)