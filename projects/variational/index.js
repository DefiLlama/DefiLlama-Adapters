const { sumTokens2 } = require('../helper/unwrapLPs');

const OLP_VAULT = '0x74bbbb0e7f0bad6938509dd4b556a39a4db1f2cd';

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  return sumTokens2({
    api,
    owner: OLP_VAULT,
    fetchCoValentTokens: true,
  })
}

module.exports = {
  start: 1722470400, // Aug 2024 mainnet launch
  misrepresentedTokens: false,
  methodology: `TVL counts all tokens held in Variational's Core OLP Vault (${OLP_VAULT}) on Arbitrum. This represents the main collateral/liquidity pool for perpetual futures trading via the Omni Liquidity Provider (OLP).`,
  arbitrum: { tvl }
};