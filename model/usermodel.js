const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")
const userdata = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    forgotpasswordOtp :{
        type: Number,
        default: -1
    },
    expensedata: [{type: mongoose.Schema.Types.ObjectId, ref: "expensedata"}]
})
userdata.plugin(plm)
module.exports = new mongoose.model("collectionname", userdata)