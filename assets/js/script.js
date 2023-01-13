// Import
import { getPolygon } from './polygon.js';
import { getAlphaVantage, parseAlphaVantage } from './alphaVantage.js';
import { getFRED, parseFREDdata } from './fred.js';
import { changeTime } from './time.js';
import { drawChart } from './chart.js';

// Load Google Charts
google.charts.load('current', {'packages':['corechart']});

// Global Variables
let data;
let dataInTimePeriodIndex = 0;
let selectedTimePeriod = '3-m';
let selectedPage = 'Stocks';

// Query Selectors
// let navbarBtns = document.querySelector(".navbar-btn");
// let defaultBtns = document.querySelector(".default-btn");
let timeBtns = document.querySelector(".time-btns");
// let searchInput = document.querySelector("#search");

// Event Listeners
// navbarBtns.addEventListener('click', changePage);
// defaultBtns.addEventListener('click', );
timeBtns.addEventListener('click', changeTime);
// searchInput.addEventListener(, ); // Might not be necessary




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