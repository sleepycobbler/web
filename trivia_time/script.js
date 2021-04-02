var connection;
var userType;
var session_token;
var currentUsername;
var numUsers = 0;
var currentQuestion;

var gameInProgress = false;
var questionActive = false;

var categories = [];
var catQNum = [];
var difficulties = ['easy', 'medium', 'hard'];

QUESTION = {
  code: 'Q',
  category: "None",
  type: "None",
  difficulty: "None",
  question: "None",
  correct_answer: "None",
  incorrect_answers: []
}

async function getToken() {
  var myToken;
  fetch('https://opentdb.com/api_token.php?command=request')
    .then((response) => response.json())
    .then((question) => {
      session_token = question.token;
    })
}

getToken();

async function getJSON(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw Error(response.statusText);
    } else {
      const fetchJson = await response.json();
      return fetchJson;
    }
  } catch (error) {
    console.log(error);
  }
}

async function go() {
  connection.send(JSON.stringify({
    code: 'GO'
  }));
}

async function setUsers(num) {
  document.getElementById('numPlayers').innerHTML = 'Number of Players: ' + num;
}

async function sendChoice(element) {
  connection.send(JSON.stringify({
    code: 'RSP',
    choice: element.innerHTML,
    username: currentUsername
  }))
  document.getElementById('root').innerHTML = '<h1>Please Wait...</h1>';
}

async function setQuestion(newQuestion) {
  var newPage = '<h1>' + newQuestion.question + '</h1><ul>';
  newQuestion['choices'].forEach(choice => {
    newPage += '<li id=\'choice\' onclick=\'sendChoice(this)\'>' + choice + '</li>';
  });

  newPage += '</ul>';
  document.getElementById('root').innerHTML = newPage;
}

async function sendQuestion() {
  const response = await getJSON('https://opentdb.com/api.php?amount=1&token=' + session_token);
  question = response.results[0];
  question['code'] = 'Q';
  connection.send(JSON.stringify(response.results[0]));
}

async function displayHostOptions() {
  document.getElementById('checklist').innerHTML = '';

  fetch('https://opentdb.com/api_category.php')
    .then((response) => response.json())
    .then((categoryList) => {
      console.log(categoryList.trivia_categories);
      categories = categoryList.trivia_categories
    })
    .then(nextStep => {
      categories.forEach(category => {
        fetch('https://opentdb.com/api_count.php?category=' + category.id.toString())
          .then((response) => response.json())
          .then((categoryNums) => {
            console.log(categoryNums);
            catQNum.push(categoryNums.category_question_count);
          })
          .then(finalStep => {
            console.log('step2');
            console.log(category);
            document.getElementById('checklist').innerHTML += '<input type=\"checkbox\" id=\"' + category.id + '\" name=\"' + category.name + '\" value=\"' + category.id + '\">' +
              '<label for=\"' + category.id + '\">' + category.name + '</label><br>' +
              '<input type=\"checkbox\" id=\"easy ' + category.id + '\" name=\"easy\" value=\"easy\">' +
              '<label for=\"' + category.id + ' easy\">Easy Questions (' + catQNum[catQNum.length - 1].total_easy_question_count + ' count)</label><br>' +
              '<input type=\"checkbox\" id=\"medium ' + category.id + '\" name=\"medium\" value=\"medium\">' +
              '<label for=\"' + category.id + ' medium\">Medium Questions (' + catQNum[catQNum.length - 1].total_medium_question_count + ' count)</label><br>' +
              '<input type=\"checkbox\" id=\"hard ' + category.id + '\" name=\"hard\" value=\"hard\">' +
              '<label for=\"' + category.id + ' hard\">Hard Questions (' + catQNum[catQNum.length - 1].total_hard_question_count + ' count)</label><br>';
          })
      })
    })
}

async function startConnect() {
  document.getElementById('joinGame').style.visibility = 'hidden';
  var tempName = document.getElementById('username').value.toString();
  if (!tempName.match(/^[0-9a-zA-Z]+$/) && tempName.length.toInt() < 26) {
    alert("Please input a valid username using only letters and numbers, and less than 26 characters.");
    return;
  }
  currentUsername = tempName;
  var serverUrl;
  var scheme = "ws";

  // If this is an HTTPS connection, we have to use a secure WebSocket
  // connection too, so add another "s" to the scheme.

  if (document.location.protocol === "https:") {
    scheme += "s";
  }

  serverUrl = scheme + "://192.225.186.243:3000";

  connection = new WebSocket(serverUrl);

  connection.onopen = async function (evt) {
    console.log("***ONOPEN");
    connection.send(JSON.stringify({
      code: 'USR',
      username: tempName
    }))
  };
  console.log("***CREATED ONOPEN");

  connection.onmessage = async function (event) {
    console.log("***ONMESSAGE");
    console.log("Message received: ");
    console.log(event);
    console.log(session_token);

    data = JSON.parse(event.data);
    switch (data.code) {
      case 'HOST':
        console.log("I am a host");
        userType = 'host';
        document.getElementById('startGame').style.visibility = 'visible';
        connection.send(JSON.stringify({
          code: 'ACK'
        }));
        displayHostOptions();
        // https://opentdb.com/api_category.php Get Category List
        // https://opentdb.com/api_count.php?category=CATEGORY_ID_HERE Get number of questions per category
        // 
        break;
      case 'PLAYER':
        console.log("I am a player");
        userType = 'player';
        connection.send(JSON.stringify({
          code: 'ACK'
        }));
        break;
      case 'RDY':
        if (userType == 'host') {
          sendQuestion();
        }
        gameInProgress = true;
        break;
      case 'STATE':
        numUsers = data.numUsers;
        setUsers(numUsers);
        currentQuestion = data.currentQuestion;
        if (currentQuestion.question !== "None") {
          setQuestion(currentQuestion);
        }
        break;
      case 'A':
        var newPage = '<h1>The correct Answer was: ' + data.correctAnswer + '</h1><h2>Current Scores:</h2><ul>';
        data['scores'].forEach(player => {
          newPage += '<li>' + player.username + ': ' + player.score + '</li>';
        });
        newPage += '</ul>';
        if (userType == 'host') {
          newPage += '<button id=\'gameContinue\' onclick=\"sendQuestion()\">Next Question</button>';
        }
        document.getElementById('root').innerHTML = newPage;
    }
  };

  console.log("***CREATED ONMESSAGE");

}