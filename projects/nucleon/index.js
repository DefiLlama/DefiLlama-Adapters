const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require("../helper/unknownTokens");

const MasterchefV2 = "0xeced26633b5c2d7124b5eae794c9c32a8b8e7df2";
// const NUT_TokenAddress = "0xfe197e7968807b311d476915db585831b43a7e3b";
const XCFX_TokenAddress = "0x889138644274a7dc602f25a7e7d53ff40e6d0091";

const CFX_NUT_LP_TokenAddress = "0xd9d5748cb36a81fe58f91844f4a0412502fd3105";
const CFX_XCFX_LP_TokenAddress = "0x949b78ef2c8d6979098e195b08f27ff99cb20448";

const WCFX = ADDRESSES.conflux.WCFX;

module.exports = {
  conflux: {
    tvl: async (api) => {
      const [exchangeRate] = await api.call({ target: '0x808f81acc4618a05c8253a7b41240468c08cd64c', abi: 'function XCFX_burn_estim(uint256) returns (uint256,uint256)', params: 1e18 +''})
      return {
        ['conflux:' + WCFX]: (await api.call({ target: XCFX_TokenAddress, abi: 'erc20:totalSupply' })) * exchangeRate / 1e18
      }
    },
    pool2: sumTokensExport({ owner: MasterchefV2, coreAssets: [WCFX], tokens: [CFX_NUT_LP_TokenAddress, CFX_XCFX_LP_TokenAddress] }),
  }
}