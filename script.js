// Global Variables
let polygon_APIKEY = 'TTNbgrcWIJyP1tavyIdjxgTywo6ixljm';
let alpha_vantage_APIKEY = '0BGSBFE3M96OL784';

// Query Selectors


// Call Functions
// getPolygon('SPX');
// getAlphaVantage('IBM');

// Access Data from Polygon API
async function getPolygon(ticker) {
  let response = await fetch(`https://api.polygon.io/v3/reference/tickers/${ticker}?date=2023-01-12&apiKey=${polygon_APIKEY}`);
  let data = await response.json();
  console.log(data);
  return data;
}

// Access Data from Alpha Vantage API
async function getAlphaVantage(ticker, outputSize) {
  // If outputSize is 'compact', will only fetch last 100 days; 'full' responds with 20+ years of data
  outputSize = outputSize || 'full';
  let response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${ticker}&outputsize=${outputSize}&apikey=${alpha_vantage_APIKEY}`);
  let data = await response.json();
  console.log(data);
  return data;
}

// Access Data from FRED API


// Parse Polygon Response


// Parse FRED Response


// Visualize Data with D3


// Update Chart DOM


// Clear Chart Container


// Change Time Range

