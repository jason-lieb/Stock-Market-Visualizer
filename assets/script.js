//API Keys
let polygon_APIKEY = "TTNbgrcWIJyP1tavyIdjxgTywo6ixljm";
let alpha_vantage_APIKEY = "0BGSBFE3M96OL784";
// let fred_APIKEY = "ce4ba2fd678f9dfc7903324adee68449"; //depreciated
let bea_APIKEY = "D34BBF56-E892-4E7A-9427-83869BD3A09D";

// Global Variables
let global = {
  data: undefined,
  dataInTimePeriodIndex: 0,
  selectedTimePeriod: "3-m",
  selectedPage: "Stocks",
};

// Query Selectors
let chartContainer = document.querySelector("#chart");

let navbarBtns = document.querySelector("#navbar-btns");
let defaultBtns = document.querySelector("#default-btns");
let timeBtns = document.querySelector("#time-btns");
let searchInput = document.querySelector("#search");

let stockCard = document.querySelector("#stock-card");
let governCard = document.querySelector("#governdata-card");
let currencyCard = document.querySelector("#currency-card");

let toCurrencyInput = document.querySelector("#toCurrency");
let fromCurrencyInput = document.querySelector("#fromCurrency");
let currencyBtn = document.querySelector("#loadCurrency");

let threeMonBtn = document.querySelector("#three-mon-btn");
let sixMonBtn = document.querySelector("#six-mon-btn");
let ytd = document.querySelector("#ytd-btn");
let oneYBtn = document.querySelector("#one-y-btn");
let threeYBtn = document.querySelector("#three-y-btn");
let tenYBtn = document.querySelector("#ten-y-btn");
let allBtn = document.querySelector("#all-btn");

// Event Listeners
navbarBtns.addEventListener("click", handlePage);
defaultBtns.addEventListener("click", handleDefault);
timeBtns.addEventListener("click", handleTime);
searchInput.addEventListener("keypress", handleSearch);
currencyBtn.addEventListener("click", handleSelect);

// Load Google Charts
google.charts.load("current", { packages: ["corechart"] });

// Initialization Function
async function init() {
  let currencyOptions = await loadCurrencyOptions();
  addCurrencyOptions(toCurrencyInput, currencyOptions, "To");
  addCurrencyOptions(fromCurrencyInput, currencyOptions, "From");
}

init();

async function loadCurrencyOptions() {
  let response = await fetch("./assets/currencyOptions.json");
  let currencyOptions = await response.json();
  let optionHTML = "";
  for (let i = 0; i < currencyOptions.length; i++) {
    optionHTML += `<option value="${currencyOptions[i]}">${currencyOptions[i]}</option>`;
  }
  return optionHTML;
}

function addCurrencyOptions(parent, currencyOptions, direction) {
  let optionHTML = `<option>${direction} Currency</option>`;
  optionHTML += currencyOptions;
  let select = parent.children[1];
  select.innerHTML = optionHTML;
}

////////////////////////////////////////////////// Functions to Handle Inputs /////////////////////////////////////////////////////////////////////

function handlePage(e) {
  if (e.target.dataset.value === undefined) return;
  if (e.target.dataset.value === global.selectedPage) return;
  // undoBtnSelection() // Remove styling from currently selected button
  global.selectedPage = e.target.dataset.value;
  // selectBtn() // Change Styling of Navbars to unselect old page and select new page
  changeUIforPage(e.target);
}

function handleTime(e) {
  if (e.target.dataset.value === undefined) return;
  if (e.target.dataset.value === global.selectedTimePeriod) return;
  global.selectedTimePeriod = e.target.dataset.value;
  // undoBtnSelection() // Remove styling from currently selected button
  if (global.data !== undefined) updateChart();
  // selectBtn() // Change Styling of Navbars to unselect old page and select new page
}

function handleDefault(e) {
  if (e.target.dataset.value === undefined) return;
  let input = e.target.dataset.value;
  handleData(input);
}

function handleSearch(e) {
  if (e.key !== "Enter") return;
  let search = searchInput.value;
  searchInput.value = "";
  handleData(search);
}

function handleSelect(e) {
  let fromCurrency = e.target.previousElementSibling.children[1];
  let toCurrency =
    e.target.previousElementSibling.previousElementSibling.children[1];
  if (
    fromCurrency.value === "From Currency" ||
    toCurrency.value === "To Currency"
  )
    return; // Add better error handling
  handleData(`${toCurrency.value}/${fromCurrency.value}`);
}

async function handleData(input) {
  clearChart();
  // addLoadingSymbol();
  await getData(input);
  // for (let i = 0; i < 1000000000; i++) { ////////// For testing loading symbol
  //   let j = i;
  // }
  clearChart();
  updateChart();
}

// function undoSelectedBtn() {
//   //
// }

// function selectBtn() {
//   //
// }

function changeUIforPage(page) {
  if (page.dataset.value === "Stocks") {
    // Stock
    show(stockCard);
    show(searchInput);
    // Currency
    hide(currencyCard);
    hide(toCurrencyInput);
    hide(fromCurrencyInput);
    hide(currencyBtn);
    // Government
    hide(governCard);
    enable(threeMonBtn, sixMonBtn, ytd, oneYBtn, threeYBtn);
    disable(allBtn);
  }
  if (page.dataset.value === "Currency") {
    // Stock
    hide(stockCard);
    hide(searchInput);
    // Currency
    show(currencyCard);
    show(toCurrencyInput);
    show(fromCurrencyInput);
    show(currencyBtn);
    // Government
    hide(governCard);
    enable(threeMonBtn, sixMonBtn, ytd, oneYBtn, threeYBtn);
    disable(allBtn);
  }
  if (page.dataset.value === "Government Data") {
    // Stock
    hide(stockCard);
    hide(searchInput);
    // Currency
    hide(currencyCard);
    hide(toCurrencyInput);
    hide(fromCurrencyInput);
    hide(currencyBtn);
    // Government
    show(governCard);
    disable(threeMonBtn, sixMonBtn, ytd, oneYBtn, threeYBtn);
    enable(allBtn);
  }
}

function hide(selector) {
  selector.classList.add("d-none");
}

function show(selector) {
  selector.classList.remove("d-none");
}

function enable(s_1, s_2, s_3, s_4, s_5) {
  for (let i = 0; i < arguments.length; i++) {
    arguments[i].classList.remove("disabled");
  }
}

function disable(s_1, s_2, s_3, s_4, s_5) {
  for (let i = 0; i < arguments.length; i++) {
    arguments[i].classList.add("disabled");
  }
}

function addLoadingSymbol() {
  chartContainer.innerHTML = `
    <div id="loading" class="spinner-border" style="width: 5rem; height: 5rem;" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    `;
}
//////////////////////////////////////////////// Data Management Functions /////////////////////////////////////////////////////////////////////

async function getData(input) {
  let newData;
  switch (global.selectedPage) {
    case "Stocks":
      // newData = await getAlphaVantageStock(input); //Commented out to prevent accidental usage of limited API calls
      // global.data = parseAlphaVantage(newData);
      global.data = await importTestData(
        "../testData/testStockDataAmazon.json"
      ); ///////// Temporarily here to use test data
      break;
    case "Currency":
      let toCurrency = input.split("/")[0];
      let fromCurrency = input.split("/")[1];
      // newData = await getAlphaVantageForex(toCurrency, fromCurrency);
      // global.data = parseAlphaVantage(newData);
      global.data = await importTestData(
        "../testData/testCurrencyDataEURUSD.json"
      );
      break;
    case "Government Data":
      global.data = await getBEA();
      global.selectedTimePeriod = "200-y"; //200 to show all.
      break;
  }
}

// Create Subset of Data for Time Range
function selectDataForTimeRange() {
  // Create variables for today
  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  let day = new Date().getDate();
  // Subtract out time period
  if (global.selectedTimePeriod.split("-")[1] === "y") {
    year -= global.selectedTimePeriod.split("-")[0];
  } else if (global.selectedTimePeriod.split("-")[1] === "m") {
    if (global.selectedTimePeriod.split("-")[0] >= month) {
      year -= 1;
      month += 12 - global.selectedTimePeriod.split("-")[0];
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
  switch (global.selectedPage) {
    case "Stocks":
    case "Currency":
      for (let i = 0; i < global.data.length; i++) {
        if (global.data[i][0] < timeBound) {
          global.dataInTimePeriodIndex = i;
          allData = false;
        }
      }
      break;
    case "Government Data":
      for (let i = 0; i < global.data.length; i++) {
        if (Number(global.data[i][0]) < year) {
          global.dataInTimePeriodIndex = i;
          allData = false;
        }
      }
      break;
  }
  if (!allData) global.dataInTimePeriodIndex += 1;
}
//////////////////////////////////////////////////////// Chart Functions /////////////////////////////////////////////////////////////////////

function updateChart() {
  selectDataForTimeRange();
  drawChart();
}

// Generate Chart with Google Charts
function drawChart() {
  let chart = new google.visualization.LineChart(chartContainer);
  console.log(global.dataInTimePeriodIndex);
  let displayData = global.data.slice(global.dataInTimePeriodIndex);

  // displayData.unshift(["Time", "Stock Price"]); //////////////////////////// Modify header based on incoming data
  displayData.unshift(["Time", "Value"]); //////////////////////////// Modify header based on incoming data
  // global.data.unshift(["Time", "Stock Price"]); //////////////////////////// Modify header based on incoming data
  let chartData = google.visualization.arrayToDataTable(displayData);
  console.log(displayData);
  let options;
  switch (global.selectedPage) {
    case "stocks":
      options = {
        title: "Stock Price",
        curveType: "function",
        legend: "none",
      };
      break;
    case "Currency":
      options = {
        title: "Currency Exchange Rate",
        curveType: "function",
        legend: "none",
      };
      break;
    case "Government Data":
      let options = {
        title: "Macro Data",
        curveType: "function",
        legend: "none",
      };
      break;
  }
  chart.draw(chartData, options);
}

function clearChart() {
  chartContainer.innerHTML = ``;
}

/////////////////////////////////////////////////// Alpha Vantage API Functions /////////////////////////////////////////////////////////////////////

async function getAlphaVantageStock(ticker) {
  let response = await fetch(
    `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&outputsize=full&apikey=${alpha_vantage_APIKEY}`
  );
  let rawData = await response.json();
  return { rawData, dataKey: "Time Series (Daily)" };
}

async function getAlphaVantageForex(toCurrency, fromCurrency) {
  let response = await fetch(
    `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fromCurrency}&to_symbol=${toCurrency}&outputsize=full&apikey=${alpha_vantage_APIKEY}`
  );
  let rawData = await response.json();
  return { rawData, dataKey: "Time Series FX (Daily)" };
}

function parseAlphaVantage(rawData) {
  let dataKey = rawData.dataKey;
  rawData = rawData.rawData;
  let data = rawData[dataKey];
  let parsedData = [];
  let keys = Object.keys(data);
  for (let i = keys.length - 1; i >= 0; i--) {
    let time = Date.parse(new Date(keys[i]));
    let value = +data[keys[i]]["4. close"];
    parsedData.push([time, value]);
  }
  return parsedData;
}

/////////////////////////////////////////////////////// BEA API Functions /////////////////////////////////////////////////////////////////////

async function getBEA() {
  var url = `http://apps.bea.gov/api/data/?UserID=${bea_APIKEY}&method=getDATA&datasetname=nipa&TABLENAME=t10101&FREQUENCY=a&YEAR=ALL`;
  console.log(url);
  let response = await fetch(url);
  let data = await response.json();
  return parseBEAdata(data);
}

// Parse BEA Response
function parseBEAdata(rawData) {
  let data_temp = rawData.BEAAPI.Results.Data;
  let parsedData = [];
  for (let i = 0; i < data_temp.length; i++) {
    if (data_temp[i].LineNumber !== "1") {
      break; //only take line1 which is the real GDP data
    }
    parsedData.push([data_temp[i].TimePeriod, Number(data_temp[i].DataValue)]);
  }
  // parsedData.unshift(["Year", "Value"]);
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
  let testDataPromise = await fetch(url);
  let testData = await testDataPromise.json();
  return testData;
}

////////////////////////////////////////////////////////////////////////// For Development

// Currently unused query selectors

// let defBtn1 = document.querySelector("#def-btn1");
// let defBtn2 = document.querySelector("#def-btn2");
// let defBtn3 = document.querySelector("#def-btn3");
// let defBtn4 = document.querySelector("#def-btn4");
// let defBtn5 = document.querySelector("#def-btn5");
// let defBtn6 = document.querySelector("#def-btn6");

/* sorry I changed footer section name. Lantao */
// let footerBtns = document.querySelector(".footer-btns");
// let footerBtn1 = document.querySelector("#footer-btn1");
// let footerBtn2 = document.querySelector("#footer-btn2");
// let footerBtn3 = document.querySelector("#footer-btn3");
// let footerBtn4 = document.querySelector("#footer-btn4");
