const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const { sumTokens2 } = require("../helper/unwrapLPs");

// --- BSC Addresses ---
const masterChefContractBsc = "0x738600B15B2b6845d7Fe5B6C7Cb911332Fb89949";

const retroStakingsBsc = [
  "0xd3a1adD0a8377f67932b61d13A2c01325C41c138",
  "0xD8907e29D9945609649C001a7b9317cDF23409C5",
  "0x34B50EA0f1598b29aC4CA3C96b963d8e9Da616E1",
  "0x5Cd360D063Ab1B1c7b63cFc1D9c2690D1bd4d50F",
  masterChefContractBsc,
];

const stakingTokensBsc = [
  //TCG2
  "0xf73d8276c15ce56b2f4aee5920e62f767a7f3aea",
  //PQBERT
  "0x6ed390befbb50f4b492f08ea0965735906034f81",
  //strat: 0x34B50EA0f1598b29aC4CA3C96b963d8e9Da616E1
  //RCUBE
  "0xa6e53f07bD410df069e20Ced725bdC9135146Fe9",
  //srat: 0x5Cd360D063Ab1B1c7b63cFc1D9c2690D1bd4d50F
];

const pool2StratsBsc = [
  "0x438236Ee2Cb9c0f8b9c039ed269B0D5d81fD9c0e",
  "0xF9a424B1C6b525818ed7e5AC293331D2a40F1b48",
  "0xbfaC6d05D98f94980B08E856C072E46E01C148B6",
  "0x77C3d82946C4Bc0A93cA3F17eD65AF63a5aB0eB2",
  "0xe3646Ef0D93438eb087EB3087D0cf535880d7BC1",
];

const excludePool2Bsc = [
  "0xb2eba0ffF0B2127dDbF06274cFE27b4C5C9A8c79",
  "0x6D45A9C8f812DcBb800b7Ac186F1eD0C055e218f",
  "0x075DA65514Bc2aF2508314f8a3150ca660E6Eea1",
  "0xaBFdA784F8bc6aA54B1E401AcfF13d40148AaB2A",
  "0x9ed8C81309D5b495e52778Aac76880Cf105e4FEd",
];

// --- Polygon Addresses ---
const masterChefContractPolygon = "0x955d453892B0BA8DFc3929E7c83a6D07AFf2654a";

const retroStakingsPolygon = [
  "0x16FCAd1b7429A4E432C0074bFA53AaC9aaDB9B50",
  masterChefContractPolygon,
];

const pQBERT = "0x40038C83E459937A988b669f1159cC78d8fdad68";

const pool2StratsPolygon = ["0xB045Ea272229f9c0c94ca36C1e805226c9C8c034"];

const excludePool2Polygon = ["0x312D2eAb1c01C0c3d74f41a3B7Dd5772aD9F3Ca2"];

async function tvl(api) {
  const masterchef = api.chain === "bsc" ? masterChefContractBsc : masterChefContractPolygon;
  const blacklistedTokens = excludePool2Bsc.concat(excludePool2Polygon).concat([pQBERT])
  const poolInfos = await api.fetchList({  lengthAbi: abi.poolLength , itemAbi: abi.poolInfo, target: masterchef})
  const tokensAndOwners = poolInfos.map(poolInfo => [poolInfo.want, poolInfo.strat])
  return sumTokens2({ api, tokensAndOwners, blacklistedTokens,  })
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl,
    staking: staking(retroStakingsBsc, stakingTokensBsc),
    pool2: pool2s(pool2StratsBsc, excludePool2Bsc),
  },
  polygon: {
    tvl,
    staking: staking(retroStakingsPolygon, pQBERT),
    pool2: pool2s(pool2StratsPolygon, excludePool2Polygon),
  },
  methodology:
    "We count liquidity on the Farms through MasterChef contracts; and Saking of TCG2 and QBERT tokens through retroStaking contracts",
};
