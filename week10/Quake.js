import { getJSON } from './utilities.js';
// Quake Model
export default class Quake {
  constructor() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    this.baseUrl =
      'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' + String(Number(yyyy) - 1) + '-' + mm + '-' + dd + '&endtime=' + yyyy + '-' + mm + '-' + dd + '';
    // this is where we will store the last batch of retrieved quakes in the model.  I don't always do this...in this case the api doesn't have an endpoint to request one quake.
    this._quakes = [];
  }
  async getEarthQuakesByRadius(position, radius = 100) {
    // use the getJSON function and the position provided to build out the correct URL to get the data we need.  Store it into this._quakes, then return it
    this._quakes = await getJSON(this.baseUrl + 
      '&latitude=' 
      + String(position.lat) 
      + '&longitude=' 
      + String(position.lon) 
      + '&maxradiuskm=100')
      .then( (singleEarthquakesNearMe) => {
        return singleEarthquakesNearMe;
    })
    return this._quakes;
  }
  getQuakeById(id) {
    // filter this._quakes for the record identified by id and return it
    return this._quakes.features.filter(item => item.id === id)[0];
  }
}