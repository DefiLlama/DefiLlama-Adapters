const { nullAddress } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({ target: '0x04C154b66CB340F3Ae24111CC767e0184Ed00Cc6', abi: 'uint256:totalSupply'});
      
      return {
        [nullAddress]: totalSupply
      };
    }
  }
};
