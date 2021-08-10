const utils = require('./helper/utils');
const bigNumber = require('bignumber.js');

async function fetch() {
  let forgeData = (await utils.fetchURL('https://api.v1.punk.finance/forge')).data;
  let forgeList = forgeData.data;
  let forgeTotalTVL = new bigNumber(0);

  forgeList.forEach((forge, index) => {
    forgeTotalTVL = forgeTotalTVL.plus(bigNumber(forge.tvl).div(Math.pow(10, forge.token.decimals)));
  });

  return forgeTotalTVL.toFixed(1, bigNumber.ROUND_CEIL);
}

module.exports = {
  fetch
}
