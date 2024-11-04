const config = require("./config");

async function tvl(api) {
  const { eigenConfig, } = config[api.chain];

  let tokens = await api.call({ abi: 'address[]:getSupportedAssetList', target: eigenConfig, });
  const mlrttokens = await api.multiCall({ abi: 'function mLRTReceiptByAsset(address) view returns (address)', calls: tokens, target: eigenConfig })
  const tokenSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: mlrttokens })
  api.add(tokens, tokenSupplies)
}

async function tvl_zircuit(api) {
  const { msteth, egeth, wsteth, weth } = config[api.chain];
  const mlrttokens = [msteth, egeth]
  const tokens = [wsteth, weth]
  const tokenSupplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: mlrttokens })
  api.add(tokens, tokenSupplies)
}

module.exports = {
  ethereum: {
    tvl: tvl,
  },
  zircuit: {
    tvl: tvl_zircuit,
  }
}

module.exports.doublecounted = true