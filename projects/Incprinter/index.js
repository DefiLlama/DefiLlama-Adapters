const ADDRESSES = require("../helper/coreAssets.json");
const { getLiquityTvl } = require("../helper/liquity.js");
const { sumTokensExport } = require("../helper/unknownTokens.js");

// TroveManager holds total system collateral (deposited HEX)
const TROVE_MANAGER_ADDRESS = "0x248262ea52198643DD1512Ce7a2c93B32a03E45F";
const INC_ADDRESS = "0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d";

// Staking holds LQTY tokens and receive share of protocol revenue
const STAKING_ADDRESS = "0x35b99f29b3Ec3276A2b3Bb5863326B1c100aa160";
const PRINT_ADDRESS = "0x6C203A555824ec90a215f37916cf8Db58EBe2fA3";

const INCD_FARMING_ADDRESS = "0x5A0D3cC13A523Dd7A9279C5Eb4f363593dA4198e";
const LP_INCD_INC_ADDRESS = "0x2cb92b1e8B2fC53b5A9165E765488e17B38C26D3";

const PRINT_FARMING_ADDRESS = "0x857ab0cb7449Fb29429FC30596F08cfbf9F171F5";
const LP_PRINT_INC_ADDRESS = "0xF35F8Db9B6760799DB76796340AAcc69deA0C644";
const lps = [LP_INCD_INC_ADDRESS, LP_PRINT_INC_ADDRESS];

module.exports = {
  start: "2024-05-01",
  methodology:
    "Total Value Locked includes all Troves, Stability Pool, Staking Pool and LP Farming Pools",
  pulse: {
    tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS, { collateralToken: INC_ADDRESS }),
    staking: sumTokensExport({
      owner: STAKING_ADDRESS,
      tokens: [PRINT_ADDRESS],
      lps,
      useDefaultCoreAssets: true,
    }),
    pool2: sumTokensExport({
      owners: [INCD_FARMING_ADDRESS, PRINT_FARMING_ADDRESS],
      tokens: lps,
      useDefaultCoreAssets: true,
    }),
  },
};
