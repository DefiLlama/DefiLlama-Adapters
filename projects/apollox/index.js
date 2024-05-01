const ADDRESSES = require('../helper/coreAssets.json')
const { pool2s } = require("../helper/pool2");
const { stakings } = require("../helper/staking");
const { sumTokens, sumTokensExport, nullAddress } = require("../helper/unwrapLPs");

const stakingContract = "0x7eb5af418f199ea47494023c3a8b83a210f8846f";
const stakingContract_APX = "0x6bE863e01E17A226c945e3629D0D9Cb6E52Ce90E";
const poolContract = "0xa0ee789a8f581cb92dd9742ed0b5d54a0916976c";
const stakingContractV2 = "0x60d910f9dE5c6Fd2171716042AF2Fd3D2Aa9D942";
const poolContractV2 = "0xAf839f4D3620a1EED00cCc21dDC01119C26a75E1";
const treasureContract = "0xe2e912f0b1b5961be7cb0d6dbb4a920ace06cd99";
const treasureContractV2 = "0xcEF2dD45Da08b37fB1c2f441d33c2eBb424866A4";
const daoContract = "0x7f878994507F5B0588cF0EBEE07128d9A742ad9d";
const ALPContract = "0x1b6F2d3844C6ae7D56ceb3C3643b9060ba28FEb0";

const TOKEN_APX = "0x78f5d389f5cdccfc41594abab4b0ed02f31398b3";
const TOKEN_BSC_USD = ADDRESSES.bsc.USDT;
const TOKEN_BUSD = ADDRESSES.bsc.BUSD;
const TOKEN_CAKE = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";
const TOKEN_BABY = "0x53e562b9b7e5e94b81f10e96ee70ad06df3d2657";
const TOKEN_LEOS = "0x2c8368f8f474ed9af49b87eac77061beb986c2f1";
const TOKEN_USDC = ADDRESSES.bsc.USDC;
const TOKEN_VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const TOKEN_BANANA = "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95";
const TOKEN_MDX = "0x9c65ab58d8d978db963e63f2bfb7121627e3a739";
const TOKEN_HAY = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";

const TOKEN_BTC = ADDRESSES.bsc.BTCB;
const TOKEN_BNB = ADDRESSES.bsc.WBNB;

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

const ALPTokens = [
  nullAddress,
  TOKEN_BSC_USD,
  TOKEN_BUSD,
  TOKEN_USDC,
  TOKEN_BTC,
  TOKEN_BNB,
  TOKEN_HAY,
  ADDRESSES.bsc.ETH,
  TOKEN_CAKE,
]

async function bscTVL(timestamp, _block, { bsc: block }) {
  const toa = [
    ...TreasureTokens.map((t) => [t, treasureContract]),
    ...TreasureTokens.map((t) => [t, treasureContractV2]),
    ...ALPTokens.map((t) => [t, ALPContract]),
  ]
  return sumTokens({}, toa, block, "bsc");
}

module.exports = {
  start: 1640100600, // 12/21/2021 @ 15:30pm (UTC)
  bsc: {
    tvl: bscTVL,
    staking: stakings([stakingContract_APX, daoContract], TOKEN_APX),
    pool2: pool2s([stakingContract, stakingContractV2], [poolContract, poolContractV2]),
  },
  ethereum: {
    tvl: sumTokensExport({
      owner: '0xb40EEd68d7d6B3b6d6f4E93DE6239B7C53EFc786', tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.BUSD,
        '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9',
      ]
    })
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners:
        [
          '0xbad4ccc91ef0dfffbcab1402c519601fbaf244ef',
          '0xb3879e95a4b8e3ee570c232b19d520821f540e48'
        ], tokens: [
          nullAddress,
          ADDRESSES.arbitrum.USDC,
          ADDRESSES.arbitrum.USDT,
          ADDRESSES.arbitrum.DAI,
          ADDRESSES.arbitrum.WBTC,
          ADDRESSES.arbitrum.WETH,
        ]
    })
  },
  era: {
    tvl: sumTokensExport({
      owner: '0xD6f4e33063C881cE9a98e07E13673B92a637D908', tokens: [
        nullAddress,
        ADDRESSES.era.USDC,
      ]
    })
  },
  manta: {
    tvl: sumTokensExport({
      owner: '0xbad4ccc91ef0dfffbcab1402c519601fbaf244ef', tokens: [
        nullAddress,
        ADDRESSES.manta.USDC,
        ADDRESSES.manta.USDT,
      ]
    })
  },
  op_bnb: {
    tvl: sumTokensExport({
      owner: '0x5A5454A6030FB50ceb3eb78977D140198A27be5e', tokens: [
        nullAddress,
        ADDRESSES.op_bnb.USDT,
        ADDRESSES.op_bnb.WBNB,
      ]
    })
  },
  base: {
    tvl: sumTokensExport({
      owner: '0x9D93e5B2364070bC9837e91833F162430246DD57', tokens: [
        nullAddress,
        ADDRESSES.base.USDbC,
        ADDRESSES.base.WETH,
      ]
    })
  },
};
