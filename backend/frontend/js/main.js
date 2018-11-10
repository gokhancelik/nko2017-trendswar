//var globalUrl = "https://trendswar.herokuapp.com/";
var globalUrl = "http://localhost:8080/";

var robotId = "5a08b73b734d1d68d42e2edf";

$('#beginSection,#gameSection,#gameLoaderSection').hide();

var userStr = window.localStorage.getItem("trendsuser");
var userObj = JSON.parse(userStr);
var userNick;
var currentMatch;

if (userObj) {
    userNick = userObj["name"];
}

function giveAnswer(id, robot) {

    $(id).removeClass('btn-default').addClass('btn-primary');

    $.ajax({
        url: globalUrl + 'matches',
        data: {
            'matchId': currentMatch._id, 'userId': userObj._id, 'answer': id.value
        },
        type: 'PUT',
        success: function (response) {
            console.log('answer wrote');
        }
    });

    if (robot) {

        setTimeout(function () {
            var random = Math.floor((Math.random() * 9) + 1);
            if (random > 9) {
                random = 9;
            }

            $.ajax({
                url: globalUrl + 'matches',
                data: {
                    'matchId': currentMatch._id, 'userId': robotId, 'answer': currentMatch.words[random]
                },
                type: 'PUT',
                success: function (response) {

                    $('#choices').html(null);

                    var winnerIsMe = true;

                    if (response.answers[0].point < response.answers[1].point) {
                        winnerIsMe = false;
                    }

                    if (winnerIsMe)//winner
                    {
                        $("#myPlayer").attr("src", 'img/won.gif');
                        $("#opponent").attr("src", 'img/knockout.gif');
                    } else {
                        $("#myPlayer").attr("src", 'img/knockout.gif');
                        $("#opponent").attr("src", 'img/won.gif');
                    }
                    //celebrate
                    setTimeout(function () {

                        authOk();

                    }, 4000);
                }
            });

        }, 3000);
    }
}


function listenMatch(msg) {
    console.log('geldik');
}

function showMatchScreen(robot) {

    $("#myPlayer").attr("src", 'img/' + userObj.avatar + 'left.gif');
    if (robot) {
        $("#opponent").attr("src", 'img/robot.gif');
    }

    $choices = $("#choices");
    $choices.html(null);

    $.each(currentMatch.words, function (index, value) {

        var $buttons = $('<input/>').attr({
                type: 'button',
                id: 'btn' + index,
                name: 'btn' + index,
                value: value,
                onclick: 'giveAnswer(' + 'btn' + index + ',' + robot + ');'
            })
            .addClass('btn').addClass('btn-default').addClass('btn-sm').addClass('little-space');
        var $div = $('<div></div>').append($buttons);

        $choices.append($div);
    });

    $('#gameLoaderSection').hide();
    $('#gameSection').show();
}

function renderLeaderboard() {

    $.get(globalUrl + "users/getLeaderboard", function (data) {

        $leaders = $("#leaders");
        $leaders.html(null);

        $.each(data, function (index, value) {

            var $tr = $('<tr><td>' + (index + 1) + '</td><td>' + value.name + '</td><td>' + value.point + '</td></tr>');
            $leaders.append($tr);
        });
    });
}


function authOk() {
    $('#welcome').text('Welcome ' + userNick);
    $('#beginSection').show();
    $('#gameSection').hide();
    renderLeaderboard();
}

function call4Robot() {

    if (currentMatch.users.length == 1) {

        $.post(globalUrl + "matches", {"userId": robotId}, function (data) {

            currentMatch = data;
            showMatchScreen(true);

        }, "json");
    }
}

function getChoices() {

    $.get(globalUrl + "words", function (data) {

        $choices = $("#choices");
        $choices.html(null);

        $.each(data, function (index, value) {

            var $buttons = $('<input/>').attr({
                    type: 'button',
                    id: 'btn' + i,
                    name: 'btn' + i,
                    value: quest[i],
                    onclick: 'dosmth(' + 'btn' + i + ');'
                })
                .addClass('btn').addClass('btn-default').addClass('btn-sm').addClass('little-space');
            var $div = $('<div></div>').append($buttons);

            $choices.append($div);
        });
    });
}


$('#fightBtn').click(function () {

    //todo match fight
    $('#beginSection').hide();
    $('#gameLoaderSection').show();

    $.post(globalUrl + "matches", {"userId": userObj._id}, function (data) {

        currentMatch = data;

        call4Robot();

    }, "json");

});


if (!userNick) {

    var dialog = BootstrapDialog.show({
        title: 'Create Profile',
        closable: false,
        message: $('<form><h3>Write your nickname</h3><input required class="form-control" type="text" id="nickname" placeholder="Nickname"/><h3>Choose your character</h3><div style="margin-top:24px;"><label><input type="radio" value="p1" name="player"/>  <img src="img/p1left.gif"></label><label><input type="radio" value="p2"  name="player"/><img src="img/p2left.gif"></label></div></form>'),
        buttons: [{
            label: 'Submit',
            cssClass: 'btn-primary',
            hotkey: 13,
            action: function () {

                userNick = $('#nickname').val();
                selectedImage = $('input[name=player]:checked').val();

                if (userNick && selectedImage) {

                    $.post(globalUrl + "users", {
                        "name": userNick,
                        "avatar": selectedImage
                    }, function (data) {

                        userObj = data;
                        localStorage.setItem('trendsuser', JSON.stringify(data));
                        authOk();
                        dialog.close();

                    }, "json");

                } else {
                    alert('Enter nickname');
                }
            }
        }]
    });
}
else {
    authOk();
}