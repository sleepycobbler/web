import { QuakesController } from './QuakesController.js';

const startup = () => {
  var nes = new QuakesController('parentElement');
  nes.init();
}

document.getElementById('quakeList').addEventListener('click', startup);