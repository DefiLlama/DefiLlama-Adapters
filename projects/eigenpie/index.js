const config = require("./config");

async function tvl(api) {
  const { eigenConfig, eigenStaking } = config[api.chain];

  const tokens = await api.call({ abi: 'address[]:getSupportedAssetList', target: eigenConfig, });
  const mlrttokens = await api.multiCall({ abi: 'function mLRTReceiptByAsset(address) view returns (address)', calls: tokens, target: eigenConfig })
  const tokenBalances = []; 
  for (let i = 0; i < mlrttokens.length; i++) {
        const token = mlrttokens[i];

        try {
            const result = await api.call({ abi: 'uint256:totalSupply', target: token });
            tokenBalances.push(result);
        } catch (error) {
            console.error(`Error fetching balance for token ${token}:`, error);
        }
      }
      const oldAddress = '0xeFEfeFEfeFeFEFEFEfefeFeFefEfEfEfeFEFEFEf';  //convert native token to get price for native restaking
      const newAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
      
      for (let i = 0; i < tokens.length; i++) {
          const currentAddress = tokens[i];
          if (currentAddress.toLowerCase() === oldAddress.toLowerCase()) {
              tokens[i] = newAddress;
          }
      }
 api.add(tokens, tokenBalances)
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl,
  };
});

module.exports.doublecounted = true