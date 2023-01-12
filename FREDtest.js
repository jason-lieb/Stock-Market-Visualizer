var fs = require('fs')
var path = require('path')



console.log(path.resolve('..', '..','FRED APIkey.txt'))
var key = fs.readFileSync("./",'utf8');

// console.log(key);

const apiKey = key;
const seriesId = 'CPALTT01USM657N';

fetch(`https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`)
  .then(response => response.json())
  .then(data => console.log(data.observations.length));
