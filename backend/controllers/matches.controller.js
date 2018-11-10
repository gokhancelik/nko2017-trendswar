'use strict';
var mongoose = require('mongoose'),
    Matchs = mongoose.model('Matches'),
    Users = mongoose.model('Users'),
    TrendWords = mongoose.model('TrendWords');

exports.findOpponent = function (req, res) {
    Matchs.findOne({ $where: "this.users.length < 2" }, function (err, result) {

        if (err)
            res.send(err);
        if (!result) {
            result = new Matchs;
        }
        
        result.users = result.users.concat([req.body.userId]);
        if (!result.isNew) {

            TrendWords
                .aggregate().sample(10)
                .exec(function (err, words) {
                    if (err)
                        res.send(err);
                    words.forEach(w => {
                        result.words = result.words.concat([w.word]);
                    });
                    result.save(function (err, result2) {
                        if (err)
                            res.send(err);
                        res.json(result2);
                    });
                });
        }
        else
            result.save(function (err, result2) {
                if (err)
                    res.send(err);
                res.json(result2);
            });
    });
}
exports.answer = function (req, res) {
    //TODO: Implement socket.io
    // var nsp = io.of('/' + req.body.matchId);
    // nsp.on('connection', function (socket) {
    //     console.log(req.body.userId + ' connected');
    // });
    Matchs.findById(req.body.matchId, function (err, result) {
        googleTrends.interestOverTime({ keyword: req.body.answer, startTime: new Date('2017-01-01') }, function (err, results) {
            var totalPoint = 0;
            var parsedObject = JSON.parse(results);
            for (var i = 0; i < parsedObject.default.timelineData.length; i++) {
                var timeObject = parsedObject.default.timelineData[i];
                totalPoint += timeObject.value[0];
            }
            console.log(totalPoint);
            Users.findById(req.body.userId, function (err, user) {
                user.point += totalPoint;
                user.save(function (e, r) {
                    result.answers = result.answers.concat([{ answer: req.body.answer, user: req.body.userId, point: totalPoint }]);
                    result.save(function (err, result2) {
                        if (err)
                            res.send(err);
                        res.json(result2);
                    });
                });
            });

        });
    });
}
const googleTrends = require('google-trends-api');
function getWordPoint(word) {
    return
}