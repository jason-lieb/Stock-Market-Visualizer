let alpha_vantage_APIKEY = "0BGSBFE3M96OL784";

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
  for (let i = 0; i < keys.length; i++) {
    let time = Date.parse(new Date(keys[i]));
    let value = +data[keys[i]]["4. close"];
    parsedData.push([time, value]);
  }
  // Output data in form of array with objects with keys date and closeValue
  console.log(parsedData);
  return parsedData;
}

export { getAlphaVantage, parseAlphaVantage }