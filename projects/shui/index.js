const ADDRESSES = require('../helper/coreAssets.json')
const SCFX_TokenAddress = "0x1858a8d367e69cd9E23d0Da4169885a47F05f1bE";

const WCFX = ADDRESSES.conflux.WCFX;

module.exports = {
  conflux: {
    tvl: async (api) => {
      const ratioDepositedBySupply = await api.call({
        target: SCFX_TokenAddress,
        abi: "function ratioDepositedBySupply() public view returns (uint256)"
      });
      const totalDeposited = await api.call({
        target: SCFX_TokenAddress,
        abi: "function totalDeposited() public view returns (uint256)"
      });
      return {
        ["conflux:" + WCFX]: totalDeposited * ratioDepositedBySupply / 1e9
      };
    }
  }
};