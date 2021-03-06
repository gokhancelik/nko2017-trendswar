'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var MatchSchema = new Schema({
    users: [{ type: ObjectId, ref: 'Users' }],
    words: [{ type: String }],
    answers: [{ answer: String, user: { type: ObjectId, ref: 'Users' }, point: Number }],
    created_date: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Matches', MatchSchema);