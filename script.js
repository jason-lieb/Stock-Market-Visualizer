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

// Access Data from FRED API


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

