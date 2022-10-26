const sdk = require('@defillama/sdk');
const utils = require('../helper/utils');
const { transformPolygonAddress } = require('../helper/portedTokens');
const USDR_TOKEN_CONTRACT = '0xb5DFABd7fF7F83BAB83995E72A52B97ABb7bcf63';

async function tvlCalc() {

  const result = await utils.fetchURL("https://api.tangible.store/tvl");

  return result.data[1];
}

module.exports = {
  fetch:tvlCalc
}; 