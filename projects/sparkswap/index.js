const { getUniTVL } = require("../helper/unknownTokens");
const {
  sumTokensExport,
  nullAddress,
  sumUnknownTokens,
} = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");
const pendleAbi = require("../pendle/abi.json");

const FACTORY = "0x955219A87eB0C6754fd247266af970F7d16906CD";
const SPARK_TOKEN = "0x6386704cD6f7A584EA9D23cccA66aF7EBA5a727e";
const SPARK_LP = "0x33208439e1B28B1d6fCfbB6334e9950027Ee3B52";
const SDAI_TOKEN = "0x30FCB23A906493371b1721C8feb8815804808D74";
const SDAI_DAI_LP = "0xf32B9398a7277609772F328Fc2005D7DA5420E77";
const SDAI_SPARK_LP = "0x9095D464A29Abd1B840C1C5205FB602ae5b011FF";
const MASTERCHEF = "0x63c2a0083861F8C496A0A29BD8BA223E1180664e";
const SPARKLER = "0x44Ee223D0a9Eec269b1757685F438bddB311F1AE";

module.exports = mergeExports([
  {
    pulse: {
      tvl,
    },
  },
  {
    misrepresentedTokens: true,
    methodology:
      "TVL accounts for the liquidity on all AMM pools. Staking accounts for the SPARK locked in SPARKLER",
    pulse: {
      tvl: getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true }),
      staking: sumTokensExport({
        owners: [SPARKLER, MASTERCHEF],
        tokens: [SPARK_TOKEN, SDAI_TOKEN],
        useDefaultCoreAssets: true,
        lps: [SPARK_LP, SDAI_DAI_LP, SDAI_SPARK_LP],
      }),
    },
  }
]);

// add amount in pulsex farm
async function tvl(api) {
  let rehypothecations = await api.fetchList({
    lengthAbi: "uint256:poolLength",
    itemAbi:
      "function rehypothecations(uint256) view returns (address farm, uint256 pid)",
    target: MASTERCHEF,
  });
  rehypothecations = rehypothecations.filter((i) => i.farm !== nullAddress);
  const bals = await api.multiCall({
    abi: pendleAbi.userInfo,
    calls: rehypothecations.map(({ farm, pid }) => ({
      target: farm,
      params: [pid, MASTERCHEF],
    })),
  });
  const pInfos = await api.multiCall({
    abi: "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accFishPerShare)",
    calls: rehypothecations.map((i) => ({ target: i.farm, params: i.pid })),
  });
  pInfos.forEach((pInfo, i) => {
    api.add(pInfo.lpToken, bals[i].amount);
    // THIS IS RETURNING STUPID VALUES
    // api.add("0x2fa878ab3f87cc1c9737fc071108f904c0b0c95d", bals[i].rewardDebt);
  });
  return sumUnknownTokens({ api, useDefaultCoreAssets: true, resolveLP: true });
} // node test.js projects/sparkswap/index.js
