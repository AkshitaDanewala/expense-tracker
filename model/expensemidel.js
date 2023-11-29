const mongoose = require("mongoose")

const expensedata = new mongoose.Schema({
    Expensename: String,
    amount: Number,
    date: String,
    category: {
        type: String,
        enum: ["Food", "Grocery", "Shopping", "Travel", "Medical", "Education", "Household", "Rent & Taxes", "Other"]
    },
    month: {
        type: String,
        enum: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    paymentmode:{
        type: String,
        enum: ["cash", "online", "cheque"],
    },
    user: {type: mongoose.Schema.Types.ObjectId, ref: "collectionname"}
},
{ timestamps: true }
// ek  time vo batata hai jab banaya tab or ek jab aapne update kiya tab

)


module.exports = mongoose.model("expensedata",  expensedata )