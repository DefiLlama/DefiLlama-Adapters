const ADDRESSES = require('../helper/coreAssets.json')

// Vaults by collection — Aetheryn joins this list when its vault deploys.
const VAULTS = [
  "0xb78edcb4de39355747c62e6d55209c01a2294ad8", // Genesis Vault
];

async function tvl(api) {
  const assetRegistry = await api.call({ abi: 'address:assetRegistry', target:'0xb78edcb4de39355747c62e6d55209c01a2294ad8' });
  const stocks = await api.fetchList({  lengthAbi: 'ASSET_COUNT', itemAbi: 'function assetAt(uint8) view returns (address)', target: assetRegistry})
  const tokens = stocks.concat([ADDRESSES.robinhood.WETH])
  return api.sumTokens({ tokens, owners: VAULTS })
}

module.exports = {
  methodology: "Value of stocks and WETH held in STOCKMON vaults",
  robinhood: {
    tvl
  },
};
