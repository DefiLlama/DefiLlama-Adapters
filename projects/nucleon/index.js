const { staking, } = require("../helper/staking");
const { sumTokensExport, getTokenPrices, } = require("../helper/unknownTokens");

const MasterchefV2 = "0xeced26633b5c2d7124b5eae794c9c32a8b8e7df2";
const NUT_TokenAddress = "0xfe197e7968807b311d476915db585831b43a7e3b";
const XCFX_TokenAddress = "0x889138644274a7dc602f25a7e7d53ff40e6d0091";

const CFX_NUT_LP_TokenAddress = "0xd9d5748cb36a81fe58f91844f4a0412502fd3105";
const CFX_XCFX_LP_TokenAddress = "0x949b78ef2c8d6979098e195b08f27ff99cb20448";

const WCFX = "0x14b2d3bc65e74dae1030eafd8ac30c533c976a9b";

module.exports = {
  conflux: {
    tvl: async (_, _1, _2, { api }) => {
      const balances = {
        ['conflux:' + XCFX_TokenAddress]: await api.call({ target: XCFX_TokenAddress, abi: 'erc20:totalSupply' })
      }
      const { updateBalances, } = await getTokenPrices({ ...api, coreAssets: [WCFX], lps: [CFX_XCFX_LP_TokenAddress] })
      console.log(await api.call({ target: CFX_XCFX_LP_TokenAddress, abi: 'address:factory'}))
      return updateBalances(balances)
    },
    pool2: sumTokensExport({ owner: MasterchefV2, coreAssets: [WCFX], tokens: [CFX_NUT_LP_TokenAddress, CFX_XCFX_LP_TokenAddress] }),
    staking: staking(MasterchefV2, NUT_TokenAddress),
  }
}