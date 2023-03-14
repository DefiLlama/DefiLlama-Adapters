const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");
const { sumTokens, sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const stakingContract = "0x7eb5af418f199ea47494023c3a8b83a210f8846f";
const stakingContract_APX = "0x6bE863e01E17A226c945e3629D0D9Cb6E52Ce90E";
const poolContract = "0xa0ee789a8f581cb92dd9742ed0b5d54a0916976c";
const stakingContractV2 = "0x60d910f9dE5c6Fd2171716042AF2Fd3D2Aa9D942";
const poolContractV2 = "0xAf839f4D3620a1EED00cCc21dDC01119C26a75E1";
const treasureContract = "0xe2e912f0b1b5961be7cb0d6dbb4a920ace06cd99";
const daoContract = "0x7f878994507F5B0588cF0EBEE07128d9A742ad9d";
const ALPContract = "0x1b6F2d3844C6ae7D56ceb3C3643b9060ba28FEb0";

const TOKEN_APX = "0x78f5d389f5cdccfc41594abab4b0ed02f31398b3";
const TOKEN_BSC_USD = "0x55d398326f99059fF775485246999027B3197955";
const TOKEN_BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const TOKEN_CAKE = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
const TOKEN_BABY = "0x53e562b9b7e5e94b81f10e96ee70ad06df3d2657";
const TOKEN_LEOS = "0x2c8368f8f474ed9af49b87eac77061beb986c2f1";
const TOKEN_USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const TOKEN_VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const TOKEN_BANANA = "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95";
const TOKEN_MDX = "0x9c65ab58d8d978db963e63f2bfb7121627e3a739";
const TOKEN_HAY = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";

const TreasureTokens = [
  // TOKEN_APX,
  nullAddress,
  TOKEN_BSC_USD,
  TOKEN_BUSD,
  TOKEN_CAKE,
  TOKEN_BABY,
  TOKEN_LEOS,
  TOKEN_USDC,
  TOKEN_VUSDT,
  TOKEN_BANANA,
  TOKEN_MDX,
  TOKEN_HAY,
];

async function tvl(timestamp, _block, { bsc: block }) {
  const toa = TreasureTokens.map((t) => [t, treasureContract]);
  toa.push([TOKEN_BSC_USD, ALPContract]);
  toa.push([TOKEN_BUSD, ALPContract]);
  toa.push([TOKEN_USDC, ALPContract]);
  return sumTokens({}, toa, block, "bsc");
}

module.exports = {
  start: 1640100600, // 12/21/2021 @ 15:30pm (UTC)
  bsc: {
    tvl,
    staking: stakings([stakingContract_APX, daoContract], TOKEN_APX, "bsc"),
    pool2: pool2s([stakingContract, stakingContractV2], [poolContract, poolContractV2], "bsc"),
  },
  ethereum: {
    tvl: sumTokensExport({ owner: '0xb40EEd68d7d6B3b6d6f4E93DE6239B7C53EFc786', tokens: [
      nullAddress,
      '0xdac17f958d2ee523a2206206994597c13d831ec7',
      '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      '0x4fabb145d64652a948d72533023f6e7a623c7c53',
      '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
    ]})
  },
  arbitrum: {
    tvl: sumTokensExport({ owner: '0xbad4ccc91ef0dfffbcab1402c519601fbaf244ef', tokens: [
      nullAddress,
      '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    ]})
  },
};
