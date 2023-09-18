const sdk = require('@defillama/sdk');

module.exports = {
  methodology: "Sums Ondo's fund supplies.",
  misrepresentedTokens: true,
  doublecounted: true,
};

const config = {
  ethereum: {
    OUSG: '0x1B19C19393e2d034D8Ff31ff34c81252FcBbee92',
    USDYc: '0xe86845788d6e3e5c2393ade1a051ae617d974c09',
  },
  polygon: {
    OUSG: '0xbA11C5effA33c4D6F8f593CFA394241CfE925811',
  },
};

Object.keys(config).forEach((chain) => {
  let funds = config[chain];
  const fundKeys = Object.keys(funds); // Capture the keys (OUSG, USDYc, etc.)
  funds = Object.values(funds);
  
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api }) => {
      const ethApi = new sdk.ChainApi({ chain: 'ethereum', block: _b });
      const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: funds });
      
      const tokenPrice = (await ethApi.call({
        abi: 'uint256:rwaPrice',
        target: '0xc53e6824480d976180A65415c19A6931D17265BA',
      })) / 1e18;
      
      let totalTvl = 0;
      
      supplies.forEach((supply, index) => {
        const key = fundKeys[index];
        
        if (key === 'USDYc') {
          // Use the specific price for USDYc
          totalTvl += (supply / 1e18) * 1.006437;
        } else {
          // Use the general token price
          totalTvl += (supply / 1e18) * tokenPrice;
        }
      });
      
      return { 'usd-coin': totalTvl };
    },
  };
});
