const {
  getTokenBalance,
  getTrxBalance,
  unverifiedCall,
} = require("../helper/tron")

const stakingWaterContract = "THyHbFrG5wnxdp9Lv7AgwJ4k7Nt1dp2pzj";
const WATER = "TFMUZn349bztRCCkL2PAmkWfy23Gyn5g5r";

const stakingLumiContract = "TZD4xS3AFUixUwE28omTjeepCF6qUuxjCh";
const LUMI = "TDBNKiYQ8yfJtT5MDP3byu7f1npJuG2DBN";

async function Staking() {
  return {
    water: await getTokenBalance(WATER, stakingWaterContract),
    "lumi-credits": await getTokenBalance(LUMI, stakingLumiContract),
  };
}

const lumiFarm = "TJ6cgPpkri8cfrEh79TLdU2S16ugKHwAcW";
const waterLpToken = "TWH6NQ9tr28YoRdKuvcuQquVoEGrscPix4";

const waterFarm = "TY9mGUA8q1V9R9kmfUERpcG62SZ42gYuHW";
const lumiLpToken = "TUhZUbJaVicbQeNXHGBKxVsVuNL94usuoU";

async function Pool2() {
  const [
    waterLpTokenAmount,
    lumiLpTokenAmount,
    waterInLp,
    lumiInLp,
    trxInWaterLp,
    trxInLumiLp,
    waterLpTotalSupply,
    lumiLpTotalSupply,
  ] = await Promise.all([
    getTokenBalance(waterLpToken, lumiFarm),
    getTokenBalance(lumiLpToken, waterFarm),
    getTokenBalance(WATER, waterLpToken),
    getTokenBalance(LUMI, lumiLpToken),
    getTrxBalance(waterLpToken),
    getTrxBalance(lumiLpToken),
    unverifiedCall(waterLpToken, "totalSupply()", []),
    unverifiedCall(lumiLpToken, "totalSupply()", []),
  ]);

  return {
    water: (waterInLp * waterLpTokenAmount) / (waterLpTotalSupply / 10 ** 6),
    tron:
      (trxInWaterLp * waterLpTokenAmount) / waterLpTotalSupply +
      (trxInLumiLp * lumiLpTokenAmount) / lumiLpTotalSupply,
    "lumi-credits":
      (lumiInLp * lumiLpTokenAmount) / (lumiLpTotalSupply / 10 ** 6),
  };
}

module.exports = {
  tron: {
    staking: Staking,
    pool2: Pool2,
    tvl: (async) => ({}),
  },
};
