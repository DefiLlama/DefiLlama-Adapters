const moment = require('moment')

module.exports = (timestamp) => {
  const date = moment.unix(timestamp)

  return date.utc().format()
}
