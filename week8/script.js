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

var pageNumber = 1;
var amountPages = 0;

async function startup(url="https://www.dnd5eapi.co/api/spells/") {
    const response = await getJSON(url);
    console.log(response);
    var perPage = 10;
    amountPages = response.results.length;
    for(i = pageNumber * perPage; i > perPage * pageNumber - perPage; i--) {
        if (i < amountPages) {
            document.getElementById('root').innerHTML += '<div id=\"' + response.results[i]['index'] +  '\"onclick=\"showDeets(\'' + response.results[i]['index'] + '\')\">' + response.results[i]['name'] + ' ▼</div></br>';
        }
    }
    const left = document.getElementById('left');
    const right = document.getElementById('right');

    left.ontouchend = () => {
        setPageNumber(-1);
      };
    right.ontouchend = () => {
        setPageNumber(1);
      };
}

async function setPageNumber(num) {
    if (pageNumber == 1 && num < 0 || pageNumber > amountPages / 10 && num > 0) {
        document.getElementById('root').innerHTML = '';
        await startup();
    }
    else {
        document.getElementById('root').innerHTML = '';
        pageNumber = pageNumber + num;
        await startup();
    }
}

async function showDeets(name) {
    const response = await getJSON("https://www.dnd5eapi.co/api/spells/" + name + '/');
    document.getElementById(name).innerHTML += '<div id="deets"> ' + response.desc + ' </div>'
}

startup();
