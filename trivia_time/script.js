var connection;
var userType;
var session_token;
var currentUsername;
var numUsers = 0;
var currentQuestion;

var gameInProgress = false;
var questionActive = false;

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

async function setQuestion(newQuestion) {
  var newPage = '<h1>' + newQuestion.question + '</h1><ul>';
  var choices = [newQuestion.correct_answer].concat(newQuestion.incorrect_answers);
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
    for (choice in choices) {
      newPage += '<li>' + choice + '</li>';
    }
    newPage += '</ul>';
    document.getElementById('root').innerHTML = newPage;
  }
}

async function startConnect() {
  var tempName = document.getElementById('username').value.toString();
  if (!tempName.match(/^[0-9a-zA-Z]+$/) && tempName.length.toInt() < 26) {
    alert("Please input a valid username using only letters and numbers, and less than 26 characters.");
    return;
  }
  var serverUrl;
  var scheme = "ws";

  // If this is an HTTPS connection, we have to use a secure WebSocket
  // connection too, so add another "s" to the scheme.

  if (document.location.protocol === "https:") {
    scheme += "s";
  }

  serverUrl = scheme + "://localhost:4000/";

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
        connection.send(JSON.stringify({
          code: 'ACK'
        }));
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
          const response = await getJSON('https://opentdb.com/api.php?amount=1&token=' + session_token);
          question = response.results[0];
          question['code'] = 'Q';
          connection.send(JSON.stringify(response.results[0]));
        }
        gameInProgress = true;
        break;
      case 'STATE':
        numUsers = data.numUsers;
        currentQuestion = data.currentQuestion;
        if (currentQuestion.question !== "None") {
          setQuestion(currentQuestion);
        }
        break;
    }
  };

  console.log("***CREATED ONMESSAGE");

}