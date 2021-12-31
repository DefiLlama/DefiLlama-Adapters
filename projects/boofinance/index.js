const utils = require('../helper/utils');

async function fetch() {
  const response = await utils.fetchURL('https://b9jvsr9kc05t.usemoralis.com:2053/server/functions/getLatestMarketSize?_ApplicationId=vdlR2AWJ1Ri1xcgNQGk0gngssN6tLn6TC4nQRzDX');
  return response.data.result.totalTVL;
}

module.exports = {
  methodology: 'The total TVL for BooFinance is obtained from within our Oracle and accounts the Cauldron, Well of Souls and Stake TVLs',
  fetch
}
