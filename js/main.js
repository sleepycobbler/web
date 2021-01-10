const links = [
    {
      label: "Week1 notes",
      url: "week1/index.html"
    }
  ]


function addLinks() {
    var newListLinks = '';
    console.log("I am here!")
    for (var link in links) {
        newListLinks += '<li><a href=\'' + link.url + '\'>' + link.label + '</li>'
    }

    document.getElementById("listLinks").innerHTML = newListLinks;
}