const ADDRESSES = require('../helper/coreAssets.json')
const SCFX_TokenAddress = "0x1858a8d367e69cd9E23d0Da4169885a47F05f1bE";
const { sumTokensExport, } = require("../helper/unknownTokens");
const MasterchefV2 = "0xeced26633b5c2d7124b5eae794c9c32a8b8e7df2";

const WCFX = ADDRESSES.conflux.WCFX;
const CFX_SHUI_LP_TokenAddress = "0xF1F6e3Aa98Bac6C13230051e452065DF299a78A7";
const CFX_SCFX_LP_TokenAddress = "0x1858a8d367e69cd9E23d0Da4169885a47F05f1bE";

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
    },
    pool2: sumTokensExport({ owner: MasterchefV2, coreAssets: [WCFX], tokens: [CFX_SHUI_LP_TokenAddress, CFX_SCFX_LP_TokenAddress] }),
  }
};
