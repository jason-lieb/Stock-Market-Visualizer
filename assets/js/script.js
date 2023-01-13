// Global Variables
let polygon_APIKEY = "TTNbgrcWIJyP1tavyIdjxgTywo6ixljm";
let alpha_vantage_APIKEY = "0BGSBFE3M96OL784";
let FRED_apikey = "ce4ba2fd678f9dfc7903324adee68449";
let data;
let dataInTimePeriod;
let selectedTimePeriod = '1 Month';
let selectedPage = 'Stocks';

// Query Selectors
let navbarBtns = document.querySelector(".navbar-btn");
let stocksBtn = document.querySelector("#nav-btn1");
let currencyBtn = document.querySelector("#nav-btn2");
let govBtn = document.querySelector("#nav-btn3");

let defaultBtns = document.querySelector(".default-btn");
let defBtn1 = document.querySelector("#def-btn1");
let defBtn2 = document.querySelector("#def-btn2");
let defBtn3 = document.querySelector("#def-btn3");
let defBtn4 = document.querySelector("#def-btn4");
let defBtn5 = document.querySelector("#def-btn5");
let defBtn6 = document.querySelector("#def-btn6");

let timeBtns = document.querySelector(".time-btns");
// let threeMonBtn = document.querySelector("#3mon-btn");
// let sixMonBtn = document.querySelector("#6mon-btn");
let ytd = document.querySelector("#ytd-btn");
// let oneYBtn = document.querySelector("#1y-btn");
// let threeYBtn = document.querySelector("#3y-btn");
// let tenYBtn = document.querySelector("#10y-btn");

let footerBtns = document.querySelector(".footer-btns");
let footerBtn1 = document.querySelector("#footer-btn1");
let footerBtn2 = document.querySelector("#footer-btn2");
let footerBtn3 = document.querySelector("#footer-btn3");
let footerBtn4 = document.querySelector("#footer-btn4");
let searchInput = document.querySelector("#search");

// Event Listeners


// Imports
async function importTestData(url) {
  testData = await fetch(url);
  testData = await testData.json();
  return testData;
}
async function loadData() {
  data = await importTestData('./testData/testStockData.json');
  // data2 = await importTestData('./testStockData2.json');
}
loadData();

// Load Google Charts
google.charts.load('current', {'packages':['corechart']});

///////////////////////////////////////////// For Development
// Call Functions
async function callFunction() {
  // getPolygon('SPX');
  let rawDataAV = await getAlphaVantage("IBM");
  parseAlphaVantage(rawDataAV);
}

// callFunction() ///// Uncomment to run functions
//////////////////////////////////////////////////////

// Access Data from Polygon API
async function getPolygon(ticker) {
  let response = await fetch(
    `https://api.polygon.io/v3/reference/tickers/${ticker}?date=2023-01-12&apiKey=${polygon_APIKEY}`
  );
  let data = await response.json();
  return data;
}

// Access Data from Alpha Vantage API
async function getAlphaVantage(ticker, outputSize) {
  // If outputSize is 'compact', will only fetch last 100 days; 'full' responds with 20+ years of data
  outputSize = outputSize || "full";
  let response = await fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&outputsize=${outputSize}&apikey=${alpha_vantage_APIKEY}`
  );
  let rawData = await response.json();
  return rawData;
}

// ----------------------------------------------------Access Data from FRED API
/* CREATE A API key */
var apikey = FRED_apikey;
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
  qeuryString += "&" + key + "=" + params[key];
}
var url = `${root}series/observations?series_id=${series_id}&api_key=${apikey}&file_type=json${qeuryString}`;
function getFRED() {
  console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data.observations.length);
      parseFREDdata(data);
    });
}
// getFRED();

// Parse Alpha Vantage Response
function parseAlphaVantage(rawData) {
  let data = rawData["Time Series (Daily)"];
  let parsedData = [];
  let keys = Object.keys(data);
  for (let i = 0; i < keys.length; i++) {
    let time = Date.parse(new Date(keys[i]));
    let value = +data[keys[i]]["4. close"];
    parsedData.push([time, value]);
  }
  parsedData.unshift(['Time', 'Stock Price']);
  // Output data in form of array with objects with keys date and closeValue
  console.log(parsedData);
  return parsedData;
}

// Parse FRED Response
function parseFREDdata(rawData) {
  let data_temp = rawData.observations;
  let parsedData = [];
  for (let i = 0; i < data_temp.length; i++) {
    parsedData.push({
      date: data_temp[i].date,
      closeValue: data_temp[i].value,
    });
  }
  console.log(parsedData);
  return parsedData;
}

// Generate Chart with Google Charts
function drawChart(data) {
  let chart = new google.visualization.LineChart(document.getElementById('chart'));
  let chartData = google.visualization.arrayToDataTable(data);
  let options = {
    title: 'Stock Price',
    curveType: 'function',
    legend: 'none'
  };
  chart.draw(chartData, options);
}
// Call drawChart(data) to create a chart; make sure that data is loaded or it will throw an error