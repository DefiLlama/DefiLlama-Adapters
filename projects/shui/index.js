const ADDRESSES = require('../helper/coreAssets.json')
const SCFX_TokenAddress = "0x1858a8d367e69cd9E23d0Da4169885a47F05f1bE";
const { sumTokensExport, } = require("../helper/unknownTokens");
const SHUI2CFX = "0x4f57462a355902d6263aC4E8F6CE7Bf215B577F2";

const WCFX = ADDRESSES.conflux.WCFX;
const CFX_SHUI_LP_TokenAddress = "0x561c1412D926b3D75BaB15ABA1d7c10E31Ffb721";
const CFX_SCFX_LP_TokenAddress = "0x41e9e50952d8a2e489d0b866b78835bc2ad2a0fa";

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
    pool2: sumTokensExport({ owner: SHUI2CFX, coreAssets: [WCFX], tokens: [CFX_SHUI_LP_TokenAddress, CFX_SCFX_LP_TokenAddress] }),
  }
};
