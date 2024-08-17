const sdk = require('@defillama/sdk');
const { sumTokensExport } = require('../helper/sumTokens');

//https://support.avax.network/en/articles/6349640-how-does-the-avalanche-bridge-work
const owners = [
'bc1q2f0tczgrukdxjrhhadpft2fehzpcrwrz549u90',  // https://prnt.sc/unrBvLvw3z1t 
]

module.exports = {
  methodology: 'BTC wallets on bc1q2f0tczgrukdxjrhhadpft2fehzpcrwrz549u90',
  bitcoin: {
    tvl: sdk.util.sumChainTvls([
      sumTokensExport({ owners }),
    ]),
  },
};
