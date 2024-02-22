const { sumTokensExport, } = require("../helper/unknownTokens");

const SCFX_TokenAddress = "0x1858a8d367e69cd9E23d0Da4169885a47F05f1bE";

const WCFX = "0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b";

module.exports = {
  conflux: {
    tvl: async (_, _1, _2, { api }) => {
      const [exchangeRate] = await api.call({ target: '0x808f81acc4618a05c8253a7b41240468c08cd64c', abi: 'function XCFX_burn_estim(uint256) returns (uint256,uint256)', params: 1e18 +''})
      return {
        ['conflux:' + WCFX]: (await api.call({ target: SCFX_TokenAddress, abi: 'erc20:totalSupply' })) * exchangeRate / 1e18
      }
    },
  }
}