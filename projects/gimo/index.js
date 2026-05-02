const ADDRESSES = require('../helper/coreAssets.json');

const st0gAddress = "0x7bBC63D01CA42491c3E084C941c3E86e55951404"; // st0G - Liquid Staking 0G

module.exports = {
  methodology: "TVL counts total st0G supply converted to 0G using the st0G exchange rate.",
  "0g": {
    tvl: async (api) => {
      const totalSupply = await api.call({ target: st0gAddress, abi: 'uint256:totalSupply' });
      const rate = await api.call({ target: st0gAddress, abi: 'uint256:getRate' });
      api.add(ADDRESSES.null, (totalSupply * rate) / 1e18);
    },
  },
};
