function dateConvert(date) {
  // Get the time in HH:mm format
  var hours = ('0' + date.getHours()).slice(-2);
  var minutes = ('0' + date.getMinutes()).slice(-2);

  var time = hours + ':' + minutes;
  // Get the date in the format "12 NOV 2018"
  var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  var day = ('0' + date.getDate()).slice(-2);
  var month = months[date.getMonth()];
  var year = date.getFullYear();
  var date = day + ' ' + month + ' ' + year;

  // Combine time and date with a comma and space
  var formattedDate = time + ', ' + date;

  return formattedDate
}

module.exports = dateConvert