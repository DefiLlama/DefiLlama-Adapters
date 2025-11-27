const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapUniswapV2.js');

const OLP_VAULT = '0x74bbbb0e7f0bad6938509dd4b556a39a4db1f2cd';

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  return sumTokens2({ 
    api, 
    owner: OLP_VAULT,
    fetchBalances: true 
  });
}

module.exports = {
  start: 1722470400,
  misrepresentedTokens: false,
  methodology: `TVL counts all tokens held in Variational's Core OLP Vault (${OLP_VAULT}) on Arbitrum.`,
  arbitrum: { tvl }
};
