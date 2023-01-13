// Change Selected Time Range
function changeTime(e) {
  if (e.target.dataset.value === undefined) return;
  selectedTimePeriod = e.target.dataset.value;
  selectDataForTimeRange();
}

// Create Subset of Data for Time Range
function selectDataForTimeRange() {
  // Create variables for today
  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  let day = new Date().getDate();
  // Subtract out time period
  if (selectedTimePeriod.split('-')[1] === 'y') {
    year -= selectedTimePeriod.split('-')[0];
  } else if (selectedTimePeriod.split('-')[1] === 'm') {
    if (selectedTimePeriod.split('-')[0] >= month) {
      year -= 1;
      month += 12 - selectedTimePeriod.split('-')[0];
    }
  } else {
    month = 1;
    day = 1;
  }
  // Create Lower Bound for Time Range
  let timeBound = Date.parse(new Date(`${year}-${month}-${day}`));
  // Create Index for Data in Time Period
  dataInTimePeriodIndex = 0;
  let allData = true;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] < timeBound) {
      dataInTimePeriodIndex = i;
      allData = false;
    }
  }
  if (!allData) dataInTimePeriodIndex += 1;
}

export { changeTime, selectDataForTimeRange }