const {
  masterchefExports,
  sumTokensExport,
  nullAddress,
  sumUnknownTokens,
} = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");
const abi = require("../helper/abis/masterchef.json");
const pendleAbi = require("../pendle/abi.json");

const MASTER_CHEF_CONTRACT = "0x2c8BBd2cecC77F2d18A04027Cc03CDB8Ab103214";
const NATIVE_TOKEN = "0x6386704cD6f7A584EA9D23cccA66aF7EBA5a727e";
const NATIVE_LP_TOKEN = "0x1B044593a78E374bD0E558Aa6633D2ff13fD5Bb7";
const SPARKLER_CONTRACT = "0x7b1C460d0Ad91c8A453B7b0DBc0Ae4F300423FFB";

const chefExport = masterchefExports({
  chain: "pulse",
  masterchef: MASTER_CHEF_CONTRACT,
  nativeToken: NATIVE_TOKEN,
  lps: [NATIVE_LP_TOKEN],
  useDefaultCoreAssets: true,
});
delete chefExport.staking;

module.exports = mergeExports([
  chefExport,
  {
    pulse: {
      tvl,
      pool2: sumTokensExport({
        owner: SPARKLER_CONTRACT,
        tokens: [NATIVE_LP_TOKEN],
        useDefaultCoreAssets: true,
      }),
      staking: sumTokensExport({
        owners: [SPARKLER_CONTRACT, MASTER_CHEF_CONTRACT],
        tokens: [NATIVE_TOKEN],
        useDefaultCoreAssets: true,
        lps: [NATIVE_LP_TOKEN],
      }),
    },
  },
]);

// add amount in pulsex farm
async function tvl(_, _b, _cb, { api }) {
  let rehypothecations = await api.fetchList({
    lengthAbi: "uint256:poolLength",
    itemAbi:
      "function rehypothecations(uint256) view returns (address farm, uint256 pid)",
    target: MASTER_CHEF_CONTRACT,
  });
  rehypothecations = rehypothecations.filter((i) => i.farm !== nullAddress);
  const bals = await api.multiCall({
    abi: pendleAbi.userInfo,
    calls: rehypothecations.map(({ farm, pid }) => ({
      target: farm,
      params: [pid, MASTER_CHEF_CONTRACT],
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
