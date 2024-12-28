const { get } = require('./helper/http')

async function fetch() {
  return get('https://btn.group/pools/tvl')
}

module.exports = {
  secret: {
    fetch
  },
  fetch
}