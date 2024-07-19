const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { nullAddress } = require("../helper/tokenMapping");

const stakingWaterContract = "THyHbFrG5wnxdp9Lv7AgwJ4k7Nt1dp2pzj";
const WATER = "TFMUZn349bztRCCkL2PAmkWfy23Gyn5g5r";

const stakingLumiContract = "TZD4xS3AFUixUwE28omTjeepCF6qUuxjCh";
const LUMI = "TDBNKiYQ8yfJtT5MDP3byu7f1npJuG2DBN";

const lumiFarm = "TJ6cgPpkri8cfrEh79TLdU2S16ugKHwAcW";
const waterLpToken = "TWH6NQ9tr28YoRdKuvcuQquVoEGrscPix4";

const waterFarm = "TY9mGUA8q1V9R9kmfUERpcG62SZ42gYuHW";
const lumiLpToken = "TUhZUbJaVicbQeNXHGBKxVsVuNL94usuoU";

async function Pool2(api) {

  const [
    waterLpTokenAmount,
    lumiLpTokenAmount,
    waterInLp,
    lumiInLp,
    waterLpTotalSupply,
    lumiLpTotalSupply,
  ] = await api.batchCall([
    { abi: 'erc20:balanceOf', target: waterLpToken, params: lumiFarm },
    { abi: 'erc20:balanceOf', target: lumiLpToken, params: waterFarm },
    { abi: 'erc20:balanceOf', target: WATER, params: waterLpToken },
    { abi: 'erc20:balanceOf', target: LUMI, params: lumiLpToken },
    { abi: 'erc20:totalSupply', target: waterLpToken, },
    { abi: 'erc20:totalSupply', target: lumiLpToken, },
  ])

  const [
    { output: trxInWaterLp},
    { output: trxInLumiLp},
  ] = await Promise.all([
    sdk.api.eth.getBalance({ target: waterLpToken, chain: 'tron'}),
    sdk.api.eth.getBalance({ target: lumiLpToken, chain: 'tron'}),
  ]);

  api.add(WATER, (waterInLp * waterLpTokenAmount) / waterLpTotalSupply)
  api.add(LUMI, (lumiInLp * lumiLpTokenAmount) / lumiLpTotalSupply)
  api.add(nullAddress, (trxInWaterLp * waterLpTokenAmount) / waterLpTotalSupply)
  api.add(nullAddress, (trxInLumiLp * lumiLpTokenAmount) / waterLpTotalSupply)
}

module.exports = {
  tron: {
    staking: sumTokensExport({
      tokensAndOwners: [
        [WATER, stakingWaterContract],
        [LUMI, stakingLumiContract],
      ]
    }),
    pool2: Pool2,
    tvl: (async) => ({}),
  },
};
