const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
  ethereum: {
    tvl: async (api) =>{
      const balances = {
        [ADDRESSES.ethereum.DAI]: await api.call({target: "0xa230285d5683c74935ad14c446e137c8c8828438", abi:"uint:totalValue"})
      };
      return sumTokens2({
        balances,
        api,
        owners: [
          "0xa230285d5683C74935aD14c446e137c8c8828438",
          "0x98078db053902644191f93988341E31289E1C8FE",
          "0x5F6AE08B8AeB7078cf2F96AFb089D7c9f51DA47d",
        ],
        fetchCoValentTokens: true,
      })
    },
  },
};
