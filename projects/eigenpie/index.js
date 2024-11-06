const config = require("./config");
const ADDRESSES = require('../helper/coreAssets.json')
let zircuitMstethSupply = 0;
let zircuitEgethSupply = 0;

async function tvl(api) {
  const { eigenConfig, eigenStaking, } = config[api.chain];

  let tokens = await api.call({ abi: 'address[]:getSupportedAssetList', target: eigenConfig, });
  const mlrttokens = await api.multiCall({ abi: 'function mLRTReceiptByAsset(address) view returns (address)', calls: tokens, target: eigenConfig })
  const tokenSupplies = await api.multiCall({  abi: 'uint256:totalSupply', calls: mlrttokens})
  tokens = tokens.map(token => token.toLowerCase() === '0xeFEfeFEfeFeFEFEFEfefeFeFefEfEfEfeFEFEFEf'.toLowerCase() ?  ADDRESSES.null : token)
  console.log(tokens)  
  const adjustedSupplies = tokenSupplies.map((supply, index) => {
    const token = tokens[index];
    if (token.toLowerCase() === '0xae7ab96520de3a18e5e111b5eaab095312d7fe84') {
      
      return supply - zircuitMstethSupply; // Adjust for msteth
    } else if (token.toLowerCase() === '0x0000000000000000000000000000000000000000') {

      return supply - zircuitEgethSupply; // Adjust for egeth
    }
    return supply;
  });

  api.add(tokens, adjustedSupplies);

}

async function tvl_zircuit(api) {
  const { msteth,egeth,wsteth,weth } = config[api.chain];
  mlrttokens=[msteth,egeth]
  tokens=[wsteth,weth]  
  const tokenSupplies = await api.multiCall({  abi: 'uint256:totalSupply', calls: mlrttokens})  
  zircuitMstethSupply = tokenSupplies[0];
  zircuitEgethSupply = tokenSupplies[1];
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
