const sdk = require('@defillama/sdk');
const { getTvl } = require('../helper/aave');
const { getChainTransform } = require('../helper/portedTokens');
const { sumTokens } = require("../helper/unwrapLPs");
const ATOKENS = ['0x028171bCA77440897B824Ca71D1c56caC55b68A3', '0x101cc05f4A51C0319f570d5E146a8C625198e636', '0xd4937682df3C8aEF4FE912A96A74121C0829E664'];
const APOOL = ['0xFC66c25dbDb0606e7F9cA1d2754Eb0A0f8306dA9', '0x5E88f6dc0aa126FA28A137B24d0B4d7231352a0B', '0xB7a2930e66D84Da74CdcFE4f97FaE9fC8f1114e8'];
const COMPOUND = [
    ['0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9', '0x372025203D25589eC3aDAd82652De78eC76fFabC'],
    ['0x39AA39c021dfbaE8faC545936693aC917d5E7563', '0xE87Adc9D382Eee54C1eDE017D6E5C1324D59F457'],            
];
async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  chain = 'ethereum'
  const transformAddress = await getChainTransform(chain);
    // Compound
    await sumTokens(balances, COMPOUND, block, chain, transformAddress)

    // Aave
    await getTvl(balances, block, chain, APOOL, ATOKENS, id => id)

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  }
}; // node test.js projects/fluidity-money/index.js