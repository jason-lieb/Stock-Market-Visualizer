//API Keys
let polygon_APIKEY = "TTNbgrcWIJyP1tavyIdjxgTywo6ixljm";
let alpha_vantage_APIKEY = "0BGSBFE3M96OL784";
let bea_APIKEY = "D34BBF56-E892-4E7A-9427-83869BD3A09D";
let finnhub_APIKEY = "cf2ap1aad3idqn4q4nlgcf2ap1aad3idqn4q4nm0";

// Global Variables
let global = {
  data: undefined,
  dataInTimePeriodIndex: 0,
  selectedTimePeriod: "3-m",
  selectedPage: "Stocks",
  stockHistory: undefined,
  currencyHistory: undefined
};

// Query Selectors
let chartContainer = document.querySelector("#chart");

let searchDefault = document.querySelector('#search_default');

let navbarBtns = document.querySelector("#navbar-btns");
let defaultBtns = document.querySelector("#default-btns");
let timeBtns = document.querySelector("#time-btns");
let searchInput = document.querySelector("#search");

let stockCard = document.querySelector("#stock-card");
let governCard = document.querySelector("#governdata-card");
let currencyCard = document.querySelector("#currency-card");

let currencyInputs = document.querySelector('#currencyInputs');
let toCurrencyInput = document.querySelector("#toCurrency");
let fromCurrencyInput = document.querySelector("#fromCurrency");
let currencyBtn = document.querySelector("#loadCurrency");

let defaultText = document.querySelector("#defaultText");

let scrollingData = document.querySelector('#scrolling');

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

// Initialize
init();

//////////////////////////////////////////////// Initialization Functions /////////////////////////////////////////////////////////////////////

async function init() {
  selectBtn();
  getHistory();
  createWelcome();
  let currencyOptions = await loadCurrencyOptions();
  addCurrencyOptions(toCurrencyInput, currencyOptions);
  addCurrencyOptions(fromCurrencyInput, currencyOptions);
  getContinuousStocks();
}

async function loadCurrencyOptions() {
  let response = await fetch("./assets/currencyOptions.json");
  let currencyOptions = await response.json();
  let optionHTML = "";
  for (let i = 0; i < currencyOptions.length; i++) {
    optionHTML += `<option value="${currencyOptions[i]}">${currencyOptions[i]}</option>`;
  }
  return optionHTML;
}

function addCurrencyOptions(parent, currencyOptions) {
  let optionHTML = `<option></option>`;
  optionHTML += currencyOptions;
  let select = parent.children[1];
  select.innerHTML = optionHTML;
}

////////////////////////////////////////////////// Functions to Handle Inputs /////////////////////////////////////////////////////////////////////

function handlePage(e) {
  if (e.target.dataset.value === undefined) return;
  if (e.target.dataset.value === global.selectedPage) return;
  undoBtnSelection()
  global.selectedPage = e.target.dataset.value;
  if (global.selectedPage === 'Government Data') {
    global.selectedTimePeriod = '200-y';
  } else if (global.selectedTimePeriod === '200-y') {
    global.selectedTimePeriod = '3-m';
  }
  selectBtn()
  changeUIforPage(e.target);
  clearChart();
  createWelcome();
}

function handleTime(e) {
  if (e.target.dataset.value === undefined) return;
  if (e.target.dataset.value === global.selectedTimePeriod) return;
  undoBtnSelection()
  global.selectedTimePeriod = e.target.dataset.value;
  selectBtn()
  if (global.data !== undefined) updateChart();
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
  handleData(inputValidation(search));
}

function inputValidation(input) {
  input = input.toString().toUpperCase();
}

function handleSelect(e) {
  let fromCurrency = e.target.parentElement.previousElementSibling.children[1];
  let toCurrency = e.target.parentElement.previousElementSibling.previousElementSibling.children[1];
  if (fromCurrency.value === '' || toCurrency.value === '') {
    addAlert('Please Choose Two Currencies');
    return
  };
  handleData(`${toCurrency.value}/${fromCurrency.value}`);
}

async function handleData(input) {
  clearChart();
  addLoadingSymbol();
  let success = await getData(input);
  if (success) {
    clearChart();
    updateChart();
    addHistory(input);
  } else {
    createWelcome();
  }
}

///////////////////////////////////////////////////////// UI Functions /////////////////////////////////////////////////////////////////////

function undoBtnSelection() {
  // Page button
  let pageId;
  switch (global.selectedPage) {
    case 'Stocks':
      pageId = 'nav-btn1';
      break;
    case 'Currency':
      pageId = 'nav-btn2';
      break;
    case 'Government Data':
      pageId = 'nav-btn3';
      break;
  }
  document.querySelector(`#${pageId}`).className = 'nav-link text-dark ms-2 px-2 my-1 mx-md-2 invisibleBorder border border-5';
  // Time button
  let timeId;
  switch (global.selectedTimePeriod) {
    case '3-m':
      timeId = 'three-mon-btn';
      break;
    case '6-m':
      timeId = 'six-mon-btn';
      break;
    case 'YTD':
      timeId = 'ytd-btn';
      break;
    case '1-y':
      timeId = 'one-y-btn';
      break;
    case '3-y':
      timeId = 'three-y-btn';
      break;
    case '10-y':
      timeId = 'ten-y-btn';
      break;
    case '200-y':
      timeId = 'all-btn';
      break;
  }
  document.querySelector(`#${timeId}`).className = 'btn btn-dark rounded-1 hoverHighlight';
}

function selectBtn() {
  // Page button
  let pageId;
  switch (global.selectedPage) {
    case 'Stocks':
      pageId = 'nav-btn1';
      break;
    case 'Currency':
      pageId = 'nav-btn2';
      break;
    case 'Government Data':
      pageId = 'nav-btn3';
      break;
  }
  document.querySelector(`#${pageId}`).className = 'nav-link text-dark ms-2 px-2 my-1 mx-md-2 border border-5 border-success border-opacity-50';
  // Time button
  let timeId;
  switch (global.selectedTimePeriod) {
    case '3-m':
      timeId = 'three-mon-btn';
      break;
    case '6-m':
      timeId = 'six-mon-btn';
      break;
    case 'YTD':
      timeId = 'ytd-btn';
      break;
    case '1-y':
      timeId = 'one-y-btn';
      break;
    case '3-y':
      timeId = 'three-y-btn';
      break;
    case '10-y':
      timeId = 'ten-y-btn';
      break;
    case '200-y':
      timeId = 'all-btn';
      break;
  }
  document.querySelector(`#${timeId}`).className = 'btn btn-dark rounded-1 btn-outline-success';
}

function changeUIforPage(page) {
  if (page.dataset.value === "Stocks") {
    // Default Title
    defaultText.textContent = 'Popular Stocks';
    // Stock
    show(stockCard);
    show(searchInput);
    // Currency
    hide(currencyCard);
    hide(currencyInputs);
    // Government
    hide(governCard);
    enable(threeMonBtn, sixMonBtn, ytd, oneYBtn, threeYBtn);
    disable(allBtn);
  }
  if (page.dataset.value === "Currency") {
    // Default Title
    defaultText.textContent = 'Popular Conversions';
    // Stock
    hide(stockCard);
    hide(searchInput);
    // Currency
    show(currencyCard);
    show(currencyInputs);
    // Government
    hide(governCard);
    enable(threeMonBtn, sixMonBtn, ytd, oneYBtn, threeYBtn);
    disable(allBtn);
  }
  if (page.dataset.value === "Government Data") {
    // Default Title
    defaultText.textContent = 'US Government Statistics';
    // Stock
    hide(stockCard);
    hide(searchInput);
    // Currency
    hide(currencyCard);
    hide(currencyInputs);
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

function addAlert(alertText) {
  // Limit of 1 alert
  if (searchDefault.children[2].id === 'alert') return;
  // Create alert
  let alert = document.createElement('div');
  alert.id = 'alert';
  alert.className = 'alert alert-danger mb-1 text-center'
  alert.textContent = alertText;
  // Insert alert in space between containers
  if (global.selectedPage === 'Currency') {
    let currencyContainer = document.querySelector('#currencyInputs');
    currencyContainer.className = 'card default-card mb-1';
  } else if (global.selectedPage === 'Stocks') {
    searchInput.className = 'form-control mb-1';
  }
  searchDefault.insertBefore(alert, alertReference);
  // Remove after 2 seconds
  setTimeout(removeAlert, 3000);
}

function removeAlert() {
  searchDefault.removeChild(document.querySelector('#alert'));
  if (global.selectedPage === 'Currency') {
    let currencyContainer = document.querySelector('#currencyInputs');
    currencyContainer.className = 'card default-card mb-5';
  } else if (global.selectedPage === 'Stocks') {
    searchInput.className = 'form-control mb-5';
  }
}

/////////////////////////////////////////// Welcome and History Functions /////////////////////////////////////////////////////////////////////

function createWelcome() {
  let selectedHistory = global.selectedPage === 'Stocks' ? 'stockHistory' : 'currencyHistory';
  let pageHistory = global[selectedHistory];
  if (global.selectedPage === 'Government Data') {
    // Government data page
    chartContainer.innerHTML = `
          <div id="welcome" class="container">
            <h2>Welcome to the ${global.selectedPage} Page</h2>
            <p>Choose whatever data you would like to see from our options on the left.</p>
          </div>
          `;
  } else if (pageHistory === null || pageHistory === undefined || pageHistory.length === 0) {
    // Stock and currency pages without history
    let pageSpecificMessage;
    switch (global.selectedPage) {
      case 'Stocks':
        pageSpecificMessage = 'Use the search bar to search for stocks by ticker or choose one of our popular options.';
        break;
      case 'Currency':
        pageSpecificMessage = 'Choose which currency you would like to change from and to or choose one of our popular options';
        break;
    }
    chartContainer.innerHTML = `
      <div id="welcome" class="container">
        <h2>Welcome to the ${global.selectedPage} Page</h2>
        <p>Your history is empty. ${pageSpecificMessage}</p>
      </div>
      `;
  } else {
    // Stock and currency with history
    let historyBtns = '';
    for (let i = 0; i < pageHistory.length; i++) {
      historyBtns += `<button id="${pageHistory[i].split('/').join('')}History" data-value="${pageHistory[i]}" class="btn btn-dark rounded-1 clickHighlight">${pageHistory[i]}</button>`;
    }
    chartContainer.innerHTML = `
      <div id="welcome" class="container">
        <h2>Welcome to the ${global.selectedPage} Page</h2>
        <div class="container" style="padding: 1.5rem;">
          <h4>Recently Searched</h4>
          <div class="d-grid gap-2" style="width: 12rem;">
            ${historyBtns}
            <button id="clearHistory" class="btn btn-danger rounded-1">Clear History</button>
          </div>
        </div>
      </div>
      `;
    for (let i = 0; i < pageHistory.length; i++) {
      let historyBtn = document.querySelector(`#${pageHistory[i].split('/').join('')}History`);
      historyBtn.addEventListener("click", handleDefault);
    }
    let clearHistoryBtn = document.querySelector('#clearHistory');
    clearHistoryBtn.addEventListener("click", clearHistory);
  }
}

function saveHistory() {
  localStorage.setItem('stockHistory', JSON.stringify(global.stockHistory));
  localStorage.setItem('currencyHistory', JSON.stringify(global.currencyHistory));
}

function getHistory() {
  global.stockHistory = JSON.parse(localStorage.getItem('stockHistory'));
  global.currencyHistory = JSON.parse(localStorage.getItem('currencyHistory'));
}

function addHistory(input) {
  if (global.selectedPage === 'Government Data') return;
  let selectedHistory = global.selectedPage === 'Stocks' ? 'stockHistory' : 'currencyHistory';
  let pageHistory = global[selectedHistory];
  if (pageHistory !== null && pageHistory !== undefined) {
    for(let i = 0; i < pageHistory.length; i++) {
      if (pageHistory[i] === input) {
        pageHistory.splice(i,1);
      }
    }
    if (pageHistory.length > 5) pageHistory.pop();
    pageHistory.unshift(input);
  } else {
    pageHistory = [input];
  }
  global[selectedHistory] = pageHistory;
  saveHistory();
}

function clearHistory() {
  global.stockHistory = [];
  global.currencyHistory = [];
  saveHistory();
  clearChart();
  createWelcome();
}

//////////////////////////////////////////////// Data Management Functions /////////////////////////////////////////////////////////////////////

async function getData(input) {
  let newData;
  switch (global.selectedPage) {
    case "Stocks":
      newData = await getAlphaVantageStock(input); //Commented out to prevent accidental usage of limited API calls
      if (Object.keys(newData.rawData).length === 0 || newData.rawData['Error Message'] !== undefined) {
        addAlert('Please Enter A Valid Stock Ticker');
        return false;
      }
      console.log(newData);
      global.data = parseAlphaVantage(newData);
      return true;
      // global.data = await importTestData(
      //   "../testData/testStockDataAmazon.json"
      // ); ///////// Temporarily here to use test data
    case "Currency":
      let toCurrency = input.split("/")[0];
      let fromCurrency = input.split("/")[1];
      newData = await getAlphaVantageForex(toCurrency, fromCurrency);
      global.data = parseAlphaVantage(newData);
      // global.data = await importTestData(
      //   "../testData/testCurrencyDataEURUSD.json"
      // );
      return true;
    case "Government Data":
      global.data = await getBEA(input);
      global.selectedTimePeriod = "200-y"; //200 to show all.
      return true;
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
        if (Number(global.data[i][0].slice(0,4)) < year) {
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
  let displayData = global.data.slice(global.dataInTimePeriodIndex);
  if (global.selectedPage === 'Stocks' || global.selectedPage === 'Currency') {
    for (let i = 0; i < displayData.length; i++) {
      displayData[i][0] = new Date(displayData[i][0]);
    }
  }
  displayData.unshift(["Time", "Value"]);
  let chartData = google.visualization.arrayToDataTable(displayData);
  let options = {};
  switch (global.selectedPage) {
    case "Stocks":
      options = {
        title: "Stock Price ($)",
        titleTextStyle: { color: "white" },
        curveType: "function",
        legend: "none",
        backgroundColor: { fill: "black" },
        colors: ["white"],
        vAxis: { textStyle: { color: "white" } },
        hAxis: { textStyle: { color: "white" } },
        explorer: {
          axis: "horizontal",
          actions: ["dragToZoom", "rightClickToReset"],
          keepInBounds: true,
        }
      };
      break;
    case "Currency":
      options = {
        title: "Currency Exchange Rate",
        titleTextStyle: { color: "white" },
        curveType: "function",
        legend: "none",
        backgroundColor: { fill: "black" },
        colors: ["white"],
        vAxis: { textStyle: { color: "white" } },
        hAxis: { textStyle: { color: "white" } },
        explorer: {
          axis: "horizontal",
          actions: ["dragToZoom", "rightClickToReset"],
          keepInBounds: true,
        }
      };
      break;
    case "Government Data":
      options = {
        title: "Macro Data %",
        titleTextStyle: {color: 'white'},
        curveType: "function",
        legend: "none",
        backgroundColor: {fill: 'black'},
        colors: ['white'],
        vAxis:{textStyle: {color: 'white'}},
        hAxis:{textStyle: {color: 'white'}},
      };
      break;
  }
  chart.draw(chartData, options);
  document.querySelector('svg').setAttribute('style', 'border-radius: 1rem');
}

function clearChart() {
  chartContainer.innerHTML = ``;
}

/////////////////////////////////////////////////// Alpha Vantage API Functions /////////////////////////////////////////////////////////////////////

// async function testError(ticker) {
//   let response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&outputsize=full&apikey=${alpha_vantage_APIKEY}`)
//   console.log(response);
//   let rawData = await response.json();
//   console.log(Object.keys(rawData).length);
// }
// testError('spx');

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

async function getBEA(input) {
  let MacroData = {
    tablename: {
      GDPannual: "t10101", //Gross domestic product percent change annual rate // line 1
      PCEannual: "t20301",
      GDPquarter: "t10101",
      PCEquarter: "t20301",
    },
  };
  let frequency = input.endsWith('quarter') ? 'q' : 'a';
  var url = `http://apps.bea.gov/api/data/?UserID=${bea_APIKEY}&method=getDATA&datasetname=nipa&TABLENAME=${MacroData.tablename[input]}&FREQUENCY=${frequency}&YEAR=ALL`;
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
  return parsedData;
}

//////////////////////////////////////////////////////// Finnhub API Functions /////////////////////////////////////////////////////////////////////

async function getFinnhub(ticker) {
  let response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${finnhub_APIKEY}`);
  if (response.status === 429) return '429 Error';
  let data = await response.json();
  return data;
}

function parseFinnhub(ticker, data) {
  let parsedData = {
    ticker,
    incPercent: Math.round(data.dp * 100) / 100,
  }
  return parsedData;
}

async function getContinuousStocks() {
  let error429 = false;
  let continuousStocks = [
    'AAPL',
    'MSFT',
    'AMZN',
    'TSLA',
    'GOOGL',
    'GOOG',
    'BRK.B',
    'UNH',
    'JNJ',
    'XOM',
    'JPM',
    'META',
    'V',
    'PG',
    'NVDA'
  ];
  let continuousData = [];
  for (let i = 0; i < continuousStocks.length; i++) {
    let data = await getFinnhub(continuousStocks[i])
    if (data === '429 Error') {
      error429 = true;
      break;
    }
    let parsedData = parseFinnhub(continuousStocks[i], data);
    continuousData.push(parsedData);
  }
  if (error429 === true) {
    continuousData = await importTestData('./testData/testContinuousStockData.json');
  };
  if (scrollingData.innerHTML === '') {
    createContinuousStocks(continuousData, error429);
  } else {
    updateContinuousStocks(continuousData, error429);
  }
  setTimeout(getContinuousStocks, 60000);
}

function createContinuousStocks(continuousData, error429) {
  if (error429 === true) {
    scrollingData.innerHTML += `
      <div id="error429" class="bg-danger card continuousStockError">
        <div class="card-body text-dark d-flex justify-content-between align-items-center py-1">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>API Calls Exceeded - Loading Test Data</span>
        </div>
      </div>
      `;
  }
  for(let i = 0; i < continuousData.length; i++) {
    let stock = continuousData[i];
    let color = stock.incPercent > 0 ? 'text-success' : 'text-danger';
    let chevron = stock.incPercent > 0 ? 'fa-chevron-up' : 'fa-chevron-down';
    let id = stock.ticker === 'BRK.B' ? 'BRK' : stock.ticker;
    scrollingData.innerHTML += `
      <div id="${id}" class="bg-dark card continuousStock">
        <div class="card-body ${color} d-flex justify-content-between py-1">
          <span>${stock.ticker}</span>
          <i class="fas ${chevron}"></i>
          <span>${stock.incPercent}%</span>
        </div>
      </div>
      `;
  }
}

function updateContinuousStocks(continuousData, error429) {
  if (error429) return;
  if (document.querySelector('#error429') !== null) {
    document.querySelector('#scrolling').removeChild(document.querySelector('#error429'));
  }
  for(let i = 0; i < continuousData.length; i++) {
    let stock = continuousData[i];
    let id = stock.ticker === 'BRK.B' ? 'BRK' : stock.ticker;
    let cardBodyHTML = document.querySelector(`#${id}`).children[0];
    let color = stock.incPercent > 0 ? 'text-success' : 'text-danger';
    cardBodyHTML.className = `card-body ${color} d-flex justify-content-between py-1`;
    let chevronHTML = cardBodyHTML.children[1];
    let chevron = stock.incPercent > 0 ? 'fa-chevron-up' : 'fa-chevron-down';
    chevronHTML.className = `fas ${chevron}`;
    let incHTML = cardBodyHTML.children[2];
    incHTML.innerHTML = `${stock.incPercent}%`;
  }
}

//////////////////////////////////////////////////////// Polygon API Function /////////////////////////////////////////////////////////////////////

// Access Data from Polygon API
async function getPolygon(ticker) {
  let response = await fetch(
    `https://api.polygon.io/v3/reference/tickers/${ticker}?date=2023-01-12&apiKey=${polygon_APIKEY}`
  );
  let data = await response.json();
  return data;
}

//////////////////////////////////////////////////////// Test Data Loading Function /////////////////////////////////////////////////////////////////////

async function importTestData(url) {
  let testDataPromise = await fetch(url);
  let testData = await testDataPromise.json();
  return testData;
}