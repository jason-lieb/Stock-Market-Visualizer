let polygon_APIKEY = "TTNbgrcWIJyP1tavyIdjxgTywo6ixljm";

// Access Data from Polygon API
export async function getPolygon(ticker) {
  let response = await fetch(
    `https://api.polygon.io/v3/reference/tickers/${ticker}?date=2023-01-12&apiKey=${polygon_APIKEY}`
  );
  let data = await response.json();
  return data;
}