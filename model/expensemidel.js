const mongoose = require("mongoose")

const expensedata = new mongoose.Schema({
    Expensename: String,
    amount: Number,
    date: String,
    category: String,
    month: String,
    user: {type: mongoose.Schema.Types.ObjectId, ref: "collectionname"}
},
{ timestamps: true }


)


module.exports = mongoose.model("expensedata",  expensedata )