const sdk = require('@defillama/sdk');

const OLP_VAULT = '0x74bbbb0e7f0bad6938509dd4b556a39a4db1f2cd';

async function tvl(timestamp, ethBlock, chainBlocks, { api }) {
  const tokens = await sdk.api.erc20.countTokens({ chain: 'arbitrum', owner: OLP_VAULT });
  return tokens;
}

module.exports = {
  start: 1722470400,
  misrepresentedTokens: false,
  methodology: `TVL counts all tokens held in Variational's Core OLP Vault (${OLP_VAULT}) on Arbitrum.`,
  arbitrum: { tvl }
};
