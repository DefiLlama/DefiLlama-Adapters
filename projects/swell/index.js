const { nullAddress } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({ target: '0xf951E335afb289353dc249e82926178EaC7DEd78', abi: 'uint256:totalSupply'});
      const rate = await api.call({ target: '0xf951E335afb289353dc249e82926178EaC7DEd78', abi: 'uint256:getRate'});
      
      return {
        [nullAddress]: (totalSupply * rate)/1e18
      };
    }
  }
};
