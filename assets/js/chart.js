// Generate Chart with Google Charts
export function drawChart(data) {
  let chart = new google.visualization.LineChart(document.getElementById('chart'));
  let chartData = google.visualization.arrayToDataTable(data.slice(dataInTimePeriodIndex).unshift(['Time', 'Stock Price']));
  let options = {
    title: 'Stock Price',
    curveType: 'function',
    legend: 'none'
  };
  chart.draw(chartData, options);
}
// Call drawChart(data) to create a chart; make sure that data is loaded or it will throw an error