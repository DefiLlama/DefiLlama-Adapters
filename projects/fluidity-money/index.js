const sdk = require('@defillama/sdk');
const { getTvl } = require('../helper/aave');
const { getChainTransform } = require('../helper/portedTokens');
const ATOKENS = ['0x028171bCA77440897B824Ca71D1c56caC55b68A3', '0x101cc05f4A51C0319f570d5E146a8C625198e636', '0x101cc05f4A51C0319f570d5E146a8C625198e636'];
const APOOL = ['0xFC66c25dbDb0606e7F9cA1d2754Eb0A0f8306dA9', '0x5E88f6dc0aa126FA28A137B24d0B4d7231352a0B', '0xB7a2930e66D84Da74CdcFE4f97FaE9fC8f1114e8'];

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await getChainTransform('ethereum');

    // Aave
    await getTvl(balances, block, 'ethereum', APOOL, ATOKENS, id => id)
    // Compound

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  }
}; // node test.js projects/fluidity-money/index.js