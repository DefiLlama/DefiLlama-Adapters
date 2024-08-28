const { nullAddress } = require("../helper/unwrapLPs");
const { sumERC4626VaultsExport } = require("../helper/erc4626");

module.exports = {
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({ target: '0x04C154b66CB340F3Ae24111CC767e0184Ed00Cc6', abi: 'uint256:totalSupply' });

      return {
        [nullAddress]: totalSupply
      };
    },
    staking: sumERC4626VaultsExport({ vaults: ['0x55769490c825CCb09b2A6Ae955203FaBF04857fd'], isOG4626: true, })
  }
};
