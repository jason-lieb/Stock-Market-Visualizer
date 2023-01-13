// ----------------------------------------------------Access Data from FRED API
let apikey = "ce4ba2fd678f9dfc7903324adee68449";
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

export { getFRED, parseFREDdata }