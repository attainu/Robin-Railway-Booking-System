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
        type:Number,
        unique:true
    },
    dateofjourney:{
        type:Date,
        required:true
    },
    seatNumber:{
        type:Number,
        unique:true,
        required:true
    },
    status:{
        type:String,
        default:'YOUR TICKET HAS BEEN CONFIRMED YOU WILL RECIEVE CONFIRMATION MESSAGE TO YOUR MAIL'
    }
})

bookingSchema.plugin(uniqueValidator)


module.exports = mongoose.model('booking',bookingSchema)