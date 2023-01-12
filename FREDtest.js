var fs = require('fs')
var path = require('path')



var key = fs.readFileSync("./FRED_APIkey.txt",'utf8');

console.log(key);

const apiKey = key;
const seriesId = 'CPALTT01USM657N';

fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=2020-01-01`)
  .then(response => response.json())
  .then(data => console.log(data.observations.length));
