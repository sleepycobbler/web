const links = [
    {
      label: "Week1 notes",
      url: "week1/index.html"
    }
  ]


function addLinks(document) {
    var newListLinks = '';

    for (var link in links) {
        newListLinks += '<li><a href=\'week1/index.html\'></li>'
    }

    document.getElementById("listLinks").innerHTML = newListLinks;
}