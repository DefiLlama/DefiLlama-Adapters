const utils = require('./helper/utils');

async function fetch() {
  const data = await utils.fetchURL('https://api.flamingo.finance/token-info/tvl');
  const tvl = data.data;
  return tvl
}

module.exports = {
  methodology: `TVL is obtained by making calls to the Flamingo Finance API "https://api.flamingo.finance/token-info/tvl".`,
  misrepresentedTokens: true,
  timetravel: false,
  fetch
}
