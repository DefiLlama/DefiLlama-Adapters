const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const TREASURY = "0x15C414870e5EdB19Ee6e94B8826A4d906D445Ea6";
const YIELD_MANAGER = "0x7f95f33aDDe588B3eA39b7CEF5f0920a79117BC0";
const IBGT_BOND = "0x84D6B4d71f317106808E8Ec8AEb10ed91599d3E9";
const LP_BOND = "0xe748f873967c4650e87b8ae325c868415bb590b2";
const INFRARED_ADAPTER = "0x0f9971C34F70067CaDC9A7Cdb19A9aC9F0b2666F";
const INFRARED_STAKING = "0x75F3Be06b02E235f6d0E7EF2D462b29739168301";

const IBGT = "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b";
const APIARY = "0x5e4d5f1E7b69Cdcd3faDb0cf182ea7821070Cbb5";
const APIARY_HONEY_LP = "0x6d03027196F4f2787012D0839915EAbD75e52945";

const owners = [TREASURY, YIELD_MANAGER, IBGT_BOND, LP_BOND];

module.exports = {
  doublecounted: true,
  start: "2026-04-06",
  methodology: "TVL is protocol-owned iBGT, HONEY, and LP positions. LP tokens unwrapped to count only HONEY side. iBGT staked on Infrared included.",
  berachain: {
    tvl: async (api) => {
      await sumTokens2({
        api,
        owners,
        tokens: [IBGT, ADDRESSES.berachain.HONEY, APIARY_HONEY_LP],
        resolveLP: true,
      });
      api.removeTokenBalance(APIARY);

      const stakedIbgt = await api.call({
        target: INFRARED_STAKING,
        abi: "erc20:balanceOf",
        params: INFRARED_ADAPTER,
      });
      api.add(IBGT, stakedIbgt);
    },
  },
};
