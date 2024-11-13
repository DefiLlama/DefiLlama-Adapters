const config = require("./config");
const ADDRESSES = require('../helper/coreAssets.json');

let cachedSupplies = null;

async function cacheZircuitSupplies(api) {
  const { msteth, egeth } = config[api.chain];
  const mlrttokens = [msteth, egeth];
  console.log(api.chain)
  // Fetch the supplies and cache them
  const tokenSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: mlrttokens, });
  cachedSupplies = {
    zircuitMstethSupply: tokenSupplies[0],
    zircuitEgethSupply: tokenSupplies[1],
  };
}

// Run this function first to initialize cached supplies for adjustments
async function setup(api) {
  if (!cachedSupplies && api.chain === 'zircuit')
     await cacheZircuitSupplies(api);
}

async function tvl(api) {
  const { eigenConfig } = config[api.chain];

  // Ensure cached supplies are populated before proceeding
  await setup(api);

  // Fetch token list and their supplies
  let tokens = await api.call({ abi: 'address[]:getSupportedAssetList', target: eigenConfig });
  const mlrttokens = await api.multiCall({ abi: 'function mLRTReceiptByAsset(address) view returns (address)', calls: tokens, target: eigenConfig });
  const tokenSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: mlrttokens });
  tokens = tokens.map(token => token.toLowerCase() === '0xeFEfeFEfeFeFEFEFEfefeFeFefEfEfEfeFEFEFEf'.toLowerCase() ? ADDRESSES.null : token);

  const adjustedSupplies = tokenSupplies.map((supply, index) => {
    const token = tokens[index];
    if (token.toLowerCase() === '0xae7ab96520de3a18e5e111b5eaab095312d7fe84') {
      return supply - cachedSupplies.zircuitMstethSupply; // Adjust for msteth
    } else if (token.toLowerCase() === '0x0000000000000000000000000000000000000000') {
      return supply - cachedSupplies.zircuitEgethSupply; // Adjust for egeth
    }
    return supply;
  });

  api.add(tokens, adjustedSupplies);
}

async function tvl_zircuit(api) {
  const { msteth, egeth, wsteth, weth } = config[api.chain];
  const mlrttokens = [msteth, egeth];
  const tokens = [wsteth, weth];

  // Fetch and cache supplies specifically for `zircuit`
  await cacheZircuitSupplies(api);

  // Now add zircuit-specific supplies
  const tokenSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: mlrttokens });
  api.add(tokens, tokenSupplies);
}

module.exports = {
  ethereum: {
    tvl: tvl,
  },
  zircuit: {
    tvl: tvl_zircuit,
  },
};

module.exports.doublecounted = true;
