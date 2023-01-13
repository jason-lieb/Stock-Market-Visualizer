//API Keys
let polygon_APIKEY = "TTNbgrcWIJyP1tavyIdjxgTywo6ixljm";
let alpha_vantage_APIKEY = "0BGSBFE3M96OL784";
let fred_APIKEY = "ce4ba2fd678f9dfc7903324adee68449";

// Global Variables
let global = {
  data: undefined,
  dataInTimePeriodIndex: 0,
  selectedTimePeriod: '3-m',
  selectedPage: 'Stocks'
}

// Query Selectors
// let navbarBtns = document.querySelector(".navbar-btn");
let defaultBtns = document.querySelector("#default-btns");
let timeBtns = document.querySelector(".time-btns");
// let searchInput = document.querySelector("#search");

// Event Listeners
// navbarBtns.addEventListener('click', changePage);
defaultBtns.addEventListener('click', handleDefault);
timeBtns.addEventListener('click', changeTime);
// searchInput.addEventListener(, ); // Might not be necessary

// Load Google Charts
google.charts.load('current', {'packages':['corechart']});

////////////////////////////////////////////////// Functions to Handle Inputs /////////////////////////////////////////////////////////////////////

function handleDefault(e) {
  if (e.target.dataset.value === undefined) return;
  switch (global.selectedPage) {
    case 'Stocks':
      let ticker = e.target.dataset.value;
      updateChart(ticker);
      break;
    case 'Currency':
      //
      //
      break;
    case 'Government Data':
      //
      //
      break;
  }
}

async function updateChart(ticker) {
  let newData = await getAlphaVantage(ticker);
  global.data = parseAlphaVantage(newData);
  selectDataForTimeRange();
  // drawChart(global.data); //////////////////// Commented out to prevent accidental usage of limited API calls
}

//////////////////////////////////////////////////////// Time Functions /////////////////////////////////////////////////////////////////////

// Change Selected Time Range
function changeTime(e) {
  if (e.target.dataset.value === undefined) return;
  global.selectedTimePeriod = e.target.dataset.value;
  selectDataForTimeRange();
  // drawChart(global.data); //////////////////// Commented out to prevent accidental usage of limited API calls
}

// Create Subset of Data for Time Range
function selectDataForTimeRange() {
  // Create variables for today
  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  let day = new Date().getDate();
  // Subtract out time period
  if (global.selectedTimePeriod.split('-')[1] === 'y') {
    year -= global.selectedTimePeriod.split('-')[0];
  } else if (global.selectedTimePeriod.split('-')[1] === 'm') {
    if (global.selectedTimePeriod.split('-')[0] >= month) {
      year -= 1;
      month += 12 - global.selectedTimePeriod.split('-')[0];
    }
  } else {
    month = 1;
    day = 1;
  }
  // Create Lower Bound for Time Range
  let timeBound = Date.parse(new Date(`${year}-${month}-${day}`));
  // Create Index for Data in Time Period
  global.dataInTimePeriodIndex = 0;
  let allData = true;
  for (let i = 0; i < global.data.length; i++) {
    if (global.data[i][0] < timeBound) {
      global.dataInTimePeriodIndex = i;
      allData = false;
    }
  }
  if (!allData) global.dataInTimePeriodIndex += 1;
}

//////////////////////////////////////////////////////// Chart Functions /////////////////////////////////////////////////////////////////////

// Generate Chart with Google Charts
function drawChart(data) {
  let chart = new google.visualization.LineChart(document.getElementById('chart'));
  let displayData = global.data.slice(global.dataInTimePeriodIndex);
  displayData.unshift(['Time', 'Stock Price']);
  let chartData = google.visualization.arrayToDataTable(displayData);
  let options = {
    title: 'Stock Price',
    curveType: 'function',
    legend: 'none'
  };
  chart.draw(chartData, options);
}
// Call drawChart(data) to create a chart; make sure that data is loaded or it will throw an error

/////////////////////////////////////////////////// Alpha Vantage API Functions /////////////////////////////////////////////////////////////////////

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

// Parse Alpha Vantage Response
function parseAlphaVantage(rawData) {
  let data = rawData["Time Series (Daily)"];
  let parsedData = [];
  let keys = Object.keys(data);
  for (let i = keys.length - 1; i >= 0; i--) {
    let time = Date.parse(new Date(keys[i]));
    let value = +data[keys[i]]["4. close"];
    parsedData.push([time, value]);
  }
  // Output data in form of array with objects with keys date and closeValue
  return parsedData;
}

/////////////////////////////////////////////////////// FRED API Functions /////////////////////////////////////////////////////////////////////
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
var url = `${root}series/observations?series_id=${series_id}&api_key=${fred_APIKEY}&file_type=json${qeuryString}`;
function getFRED() {
  console.log(url);
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log(data.observations.length);
      parseFREDdata(data);
    });
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

//////////////////////////////////////////////////////// Polygon API Functions /////////////////////////////////////////////////////////////////////

// Access Data from Polygon API
async function getPolygon(ticker) {
  let response = await fetch(
    `https://api.polygon.io/v3/reference/tickers/${ticker}?date=2023-01-12&apiKey=${polygon_APIKEY}`
  );
  let data = await response.json();
  return data;
}













///////////////////////////////////////////////////////////////////////// For Development

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
// loadData();

// Call Functions
async function callFunction() {
  // getPolygon('IBM');
  let rawDataAV = await getAlphaVantage("IBM");
  parseAlphaVantage(rawDataAV);
}

// callFunction() ///// Uncomment to run functions

// getFRED();

////////////////////////////////////////////////////////////////////////// For Development









// Currently unused query selectors

// let stocksBtn = document.querySelector("#nav-btn1");
// let currencyBtn = document.querySelector("#nav-btn2");
// let govBtn = document.querySelector("#nav-btn3");

// let defBtn1 = document.querySelector("#def-btn1");
// let defBtn2 = document.querySelector("#def-btn2");
// let defBtn3 = document.querySelector("#def-btn3");
// let defBtn4 = document.querySelector("#def-btn4");
// let defBtn5 = document.querySelector("#def-btn5");
// let defBtn6 = document.querySelector("#def-btn6");

// let threeMonBtn = document.querySelector("#3mon-btn");
// let sixMonBtn = document.querySelector("#6mon-btn");
// let ytd = document.querySelector("#ytd-btn");
// let oneYBtn = document.querySelector("#1y-btn");
// let threeYBtn = document.querySelector("#3y-btn");
// let tenYBtn = document.querySelector("#10y-btn");

// let footerBtns = document.querySelector(".footer-btns");
// let footerBtn1 = document.querySelector("#footer-btn1");
// let footerBtn2 = document.querySelector("#footer-btn2");
// let footerBtn3 = document.querySelector("#footer-btn3");
// let footerBtn4 = document.querySelector("#footer-btn4");