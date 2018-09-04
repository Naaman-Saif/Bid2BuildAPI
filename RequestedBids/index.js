const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BidSchema = new Schema({
    username:String,
    image:{ data: Buffer, contentType: String },
    Price:Number
});

module.exports = mongoose.model('RequestedBids', BidSchema);