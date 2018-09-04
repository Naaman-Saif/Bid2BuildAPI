const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BidSchema = ({
    username: String,
    image:String,
    currentBid: String,
    approved:Boolean
});

module.exports = mongoose.model('Bids',BidSchema);