//this function works on the page loading of admin home for displaying the graphs, this function defining the signed up users data
function formatDataForGraph(userData) {
  //Count signups by month
  let signupCountByMonth = {}

  var labels = []
  var data = []

  userData.forEach(user => {

    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

    var singupMonth = months[user.dateCreated.getMonth()];

    let key = `${singupMonth} `; // Format: 'YYYY-MM'

    if (signupCountByMonth[key]) {
      signupCountByMonth[key]++
    } else {
      signupCountByMonth[key] = 1
    }


  })

  // Convert signupCountsByMonth object to arrays for Chart.js
  Object.keys(signupCountByMonth).forEach(key => {
    labels.push(key)
    data.push(signupCountByMonth[key])
  })
  // console.log(labels)

  return {
    label: labels,
    data: data
  }
}

module.exports = formatDataForGraph