// Global Variables
let polygon_APIKEY = 'TTNbgrcWIJyP1tavyIdjxgTywo6ixljm';
let alpha_vantage_APIKEY = '0BGSBFE3M96OL784';

// Query Selectors


// Call Functions
async function callFunction() {
  // getPolygon('SPX');
  let rawDataAV = await getAlphaVantage('IBM');
  parseAlphaVantage(rawDataAV);
}

// callFunction() ///// Uncomment to run functions

// Access Data from Polygon API
async function getPolygon(ticker) {
  let response = await fetch(`https://api.polygon.io/v3/reference/tickers/${ticker}?date=2023-01-12&apiKey=${polygon_APIKEY}`);
  let data = await response.json();
  return data;
}

// Access Data from Alpha Vantage API
async function getAlphaVantage(ticker, outputSize) {
  // If outputSize is 'compact', will only fetch last 100 days; 'full' responds with 20+ years of data
  outputSize = outputSize || 'full';
  let response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&outputsize=${outputSize}&apikey=${alpha_vantage_APIKEY}`);
  let rawData = await response.json();
  return rawData;
}

// ----------------------------------------------------Access Data from FRED API
/* CREATE A API key */
var fs = require("fs");
var apikey = fs.readFileSync("./FRED_APIKEY.txt", "utf8");
var root = "https://api.stlouisfed.org/fred/";
var series_id = "CPIAUCSL";
/* different series data options */
[
  "GDP", //GDP returns quarterly
  "SP500", //index sp500 daily, close, daily
  "NASDAQCOM", //NASDAQ Composite Index, close, daily
  "DJIA", //Dow Jones Industrial Average, close, daily
  "CPIAUCSL", // Consumer Price Index for All Urban Consumers: All Items in U.S. City Average, monthly, only price index, not percent change
  "UNRATE", // Unemployment Rate, percent, monthly
];
/* different parameters */
[
  "observation_start", //YYYY-MM-DD formatted string, optional, default: 1776-07-04 (earliest available)
  "observation_end", //YYYY-MM-DD formatted string, optional, default: 9999-12-31 (latest available)
];
var params = { observation_start: "2020-01-01", observation_end: "2022-12-31" };
var qeuryString = "";
for (var key in params) {
  qeuryString += "&"+ key + "=" + params[key] ;
}
var url = `${root}series/observations?series_id=${series_id}&api_key=${apikey}&file_type=json${qeuryString}`;
console.log(url)

fetch(url)
  .then((response) => response.json())
  .then((data) => console.log(data.observations.length));


// Parse Alpha Vantage Response
function parseAlphaVantage(rawData) {
  let data = rawData['Time Series (Daily)'];
  let parsedData = [];
  let keys = Object.keys(data);
  for (let i = 0; i < keys.length; i++) {
    parsedData.push({ date: keys[i], closeValue: data[keys[i]]['4. close'] });
  }
  // Output data in form of array with objects with keys date and closeValue
  console.log(parsedData);
  return parsedData;
}

// Parse FRED Response


// Visualize Data with D3


// Update Chart DOM


// Clear Chart Container


// Change Time Range

