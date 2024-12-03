const config = require("./config");
const sdk = require('@defillama/sdk')

async function getZircuitSupplies(api) {
  const { msteth, egeth } = config[api.chain];
  const mlrttokens = [msteth, egeth];
  const tokenSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: mlrttokens, });
  return {
    zircuitMstethSupply: tokenSupplies[0],
    zircuitEgethSupply: tokenSupplies[1],
  };
}

async function tvl(api) {
  const { eigenConfig } = config[api.chain];

  const zircuitApi = new sdk.ChainApi({ chain: 'zircuit', timestamp: api.timestamp });
  await zircuitApi.getBlock()
  const zircuitSupplies = await getZircuitSupplies(zircuitApi);
  api.add('0xae7ab96520de3a18e5e111b5eaab095312d7fe84', zircuitSupplies.zircuitMstethSupply * -1); // Adjust for msteth
  api.add('0xeFEfeFEfeFeFEFEFEfefeFeFefEfEfEfeFEFEFEf', zircuitSupplies.zircuitEgethSupply * -1); // Adjust for egeth

  // Fetch token list and their supplies
  let tokens = await api.call({ abi: 'address[]:getSupportedAssetList', target: eigenConfig });
  const mlrttokens = await api.multiCall({ abi: 'function mLRTReceiptByAsset(address) view returns (address)', calls: tokens, target: eigenConfig });
  const tokenSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: mlrttokens });
  api.add(tokens, tokenSupplies);
}

async function tvl_zircuit(api) {
  const { msteth, egeth, wsteth, weth } = config[api.chain];
  const mlrttokens = [msteth, egeth];
  const tokens = [wsteth, weth];

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
