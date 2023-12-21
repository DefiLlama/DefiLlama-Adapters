const VAULT_CONTRACT = "0xD522395dfD017F47a932D788eC7CB058aDBbc783";
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(timestamp, block, chainBlocks, { api }) {
  const bal = await api.call({ abi: 'uint256:checkBalance', target: VAULT_CONTRACT })
  api.add(ADDRESSES.arbitrum.USDC, bal)
}

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl
  }
};
