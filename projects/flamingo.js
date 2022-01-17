const utils = require('./helper/utils');

async function fetch() {
  const data = await utils.fetchURL('https://api.flamingo.finance/token-info/tvl');
  const tvl = data.data;
  return tvl
}

module.exports = {
  misrepresentedTokens: true,
  timeTravel: false,
  fetch
}
