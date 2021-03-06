const links = [
    {
        label: "Form Validation Example",
        url: "week2/index.html"
    },
    {
        label: "Javascript Sorting Example",
        url: "week3/index.html"
    },
    {
        label: "Tic-Tac-Toe Demo",
        url: "week4/index.html"
    },
    {
        label: "D&D API Demo",
        url: "week8/index.html"
    },
    {
        label: "Music Box Demo",
        url: "week9/index.html"
    },
    {
        label: "Earthquake API Demo",
        url: "week10/index.html"
    },
    {
        label: "Trivia Time Client",
        url: "localhostClient/index.html"
    },
    {
        label: "Trivia Time Python Server - Github",
        url: "https://github.com/sleepycobbler/web/tree/master/localhostServer"
    },
    {
        label: "Absolver Deckbuilder - yarn example",
        url: "https://github.com/sleepycobbler/Absolver"
    },
    {
        label: "Absolver React Project - JSDoc",
        url: "https://sleepycobbler.github.io/Absolver/"
    },
    {
        label: "Todo Prototype",
        url: "TodoApp/index.html"
    }

  ]


function addLinks() {
    var newListLinks = '';
    console.log("I am here!")
    for (var link of links) {
        newListLinks += '<li class=\'item\'><a href=\'' + link.url + '\'><p>' + link.label + '</p></a></li>'
    }

    document.getElementById("listLinks").innerHTML = newListLinks;
}