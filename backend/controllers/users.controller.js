'use strict';
var mongoose = require('mongoose'),
    Users = mongoose.model('Users');

exports.getUsers = function (req, res) {
    Users.find({}, function (err, result) {
        if (err)
            res.send(err);
        res.json(result);
    });
}
exports.postUser = function (req, res) {
    var newUser = new Users(req.body);
    newUser.save(function (err, result) {
        if (err)
            res.send(err);
        res.json(result);
    });
}