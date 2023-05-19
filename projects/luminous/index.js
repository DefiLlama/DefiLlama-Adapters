const {
  getTokenBalance,
  getTrxBalance,
  call,
  sumTokensExport,
} = require("../helper/chain/tron");
const { nullAddress } = require("../helper/tokenMapping");

const stakingWaterContract = "THyHbFrG5wnxdp9Lv7AgwJ4k7Nt1dp2pzj";
const WATER = "TFMUZn349bztRCCkL2PAmkWfy23Gyn5g5r";

const stakingLumiContract = "TZD4xS3AFUixUwE28omTjeepCF6qUuxjCh";
const LUMI = "TDBNKiYQ8yfJtT5MDP3byu7f1npJuG2DBN";

const lumiFarm = "TJ6cgPpkri8cfrEh79TLdU2S16ugKHwAcW";
const waterLpToken = "TWH6NQ9tr28YoRdKuvcuQquVoEGrscPix4";

const waterFarm = "TY9mGUA8q1V9R9kmfUERpcG62SZ42gYuHW";
const lumiLpToken = "TUhZUbJaVicbQeNXHGBKxVsVuNL94usuoU";

async function Pool2() {
  const { api } = arguments[3]
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
    call({ target: waterLpToken, abi: 'totalSupply()', resTypes:['number'] }),
    call({ target: lumiLpToken, abi: 'totalSupply()', resTypes:['number'] }),
  ]);

  api.add(WATER, (waterInLp * waterLpTokenAmount) / waterLpTotalSupply)
  api.add(LUMI, (lumiInLp * lumiLpTokenAmount) / lumiLpTotalSupply)
  api.add(nullAddress, (trxInWaterLp * waterLpTokenAmount) / waterLpTotalSupply)
  api.add(nullAddress, (trxInLumiLp * lumiLpTokenAmount) / waterLpTotalSupply)
}

module.exports = {
  tron: {
    staking: sumTokensExport({ tokensAndOwners: [
      [WATER,stakingWaterContract],
      [LUMI,stakingLumiContract],
    ]}),
    pool2: Pool2,
    tvl: (async) => ({}),
  },
};
