const config = require("./config");
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const { eigenConfig, eigenStaking } = config[api.chain];

  let tokens = await api.call({ abi: 'address[]:getSupportedAssetList', target: eigenConfig, });
  const mlrttokens = await api.multiCall({ abi: 'function mLRTReceiptByAsset(address) view returns (address)', calls: tokens, target: eigenConfig })
  const tokenSupplies = await api.multiCall({  abi: 'uint256:totalSupply', calls: mlrttokens})
  tokens = tokens.map(token => token.toLowerCase() === '0xeFEfeFEfeFeFEFEFEfefeFeFefEfEfEfeFEFEFEf'.toLowerCase() ?  ADDRESSES.null : token)
  api.add(tokens, tokenSupplies)
}

async function tvl_zircuit(api) {
  const { msteth,egeth,wsteth,weth } = config[api.chain];
  mlrttokens=[msteth,egeth]
  tokens=[wsteth,egeth]  
  const tokenSupplies = await api.multiCall({  abi: 'uint256:totalSupply', calls: mlrttokens})  
  console.log(tokenSupplies,tokens)
  api.add(tokens, tokenSupplies)
}

module.exports = {
  ethereum: {
    tvl:tvl,

  },
  zircuit: {
      tvl:tvl_zircuit,
  }
}



module.exports.doublecounted = true