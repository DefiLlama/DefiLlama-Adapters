const { getExports } = require('../helper/heroku-api');

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "NovaP2P calculates Volume and TVL based on trades routed through the Li.Fi SDK integration on novap2p.com.",
  ...getExports("novap2p", ['polygon', 'bsc', 'ethereum', 'arbitrum'])
};
