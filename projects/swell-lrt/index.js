const { nullAddress } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      const totalSupply = await api.call({ target: '0xfae103dc9cf190ed75350761e95403b7b8afa6c0', abi: 'uint256:totalSupply'});
      const rate = await api.call({ target: '0xfae103dc9cf190ed75350761e95403b7b8afa6c0', abi: 'uint256:getRate'});
      
      return {
        [nullAddress]: (totalSupply * rate)/1e18
      };
    }
  }
};
