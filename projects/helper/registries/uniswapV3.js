const { uniV3Export } = require('../uniswapV3')
const { buildProtocolExports } = require('./utils')

const uniV3Configs = {
  "blasterswap-v3": { blast: { factory: "0x1A8027625C830aAC43aD82a3f7cD6D5fdCE89d78", fromBlock: 4308657 } },
  "comet-swap-v3": { astar: { factory: "0x2C1EEf5f87F4F3194FdAAfa20aE536b1bA49863b", fromBlock: 12168518 } },
  "warpx-v3": { megaeth: { factory: "0xf67cF9d6FC433e97Ec39Ae4b7E4451B56B171C8a", fromBlock: 4630394 } },
  "sailfish-v3": { occ: { factory: "0x963A7f4eB46967A9fd3dFbabD354fC294FA2BF5C", fromBlock: 142495 } },
  "tradegpt": { "0g": { factory: "0x6F3945Ab27296D1D66D8EEb042ff1B4fb2E0CE70", fromBlock: 5711733 } },
  "ultrasolid-v3": { hyperliquid: { factory: "0xD883a0B7889475d362CEA8fDf588266a3da554A1", fromBlock: 10742640 } },
  "juiceswap": { citrea: { factory: "0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82", fromBlock: 2651539 } },
  "weero-v3": { klaytn: { factory: "0x6603E53b4Ae1AdB1755bAF62BcbF206f90874178", fromBlock: 186673202 } },
  "lynex": {
    linea: {
      factory: "0x622b2c98123D303ae067DB4925CD6282B3A08D0F",
      fromBlock: 143660,
      isAlgebra: true,
      blacklistedTokens: ['0xb79dd08ea68a908a97220c76d19a6aa9cbde4376', '0x1e1f509963a6d33e169d9497b11c7dbfe73b7f13'],
      staking: ["0x8D95f56b0Bac46e8ac1d3A3F12FB1E5BC39b4c0c", "0x1a51b19CE03dbE0Cb44C1528E34a7EDD7771E9Af"], // [stakingContract, LYNX]
    },
  },
  "goblin-dex": {
    smartbch: { factory: '0x08153648C209644a68ED4DC0aC06795F6563D17b', fromBlock: 14169895, staking: ['0xfA3D02c971F6D97076b8405500c2210476C6A5E8', '0x56381cb87c8990971f3e9d948939e1a95ea113a3'] }, // [stakingContract, GOBLIN]
    base: { factory: '0xE82Fa4d4Ff25bad8B07c4d1ebd50e83180DD5eB8', fromBlock: 21481309, staking: ['0x866932399DEBdc1694Da094027137Ebb85D97206', '0xcdba3e4c5c505f37cfbbb7accf20d57e793568e3'] },
    bsc: { factory: '0x30D9e1f894FBc7d2227Dd2a017F955d5586b1e14', fromBlock: 42363117, staking: ['0xb4d117f9c404652030f3d12f6de58172317a2eda', '0x701aca29ae0f5d24555f1e8a6cf007541291d110'] },
  },
  "basexfi": {
    methodology: 'TVL accounts for the liquidity on all AMM pools taken from the factory contract',
    base: { factory: '0xdC323d16C451819890805737997F4Ede96b95e3e', fromBlock: 4159800 },
  },
  "basex": {
    methodology: 'TVL accounts for the liquidity on all AMM pools taken from the factory contract',
    base: { factory: '0x38015d05f4fec8afe15d7cc0386a126574e8077b', fromBlock: 3152527 },
  },
  "mute-cl": {
    misrepresentedTokens: true,
    era: { factory: '0x488A92576DA475f7429BC9dec9247045156144D3', fromBlock: 32830523 },
  },
  "solidly-v3": {
    hallmarks: [['2023-09-03', "Solidly V3 launch"]],
    ethereum: { factory: "0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687", fromBlock: 18044650 }, // same factory across chains
    optimism: { factory: "0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687", fromBlock: 115235065 },
    base: { factory: "0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687", fromBlock: 9672720, permitFailure: true },
    arbitrum: { factory: "0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687", fromBlock: 173576189, permitFailure: true },
    fantom: { factory: "0x70fe4a44ea505cfa3a57b95cf2862d4fd5f0f687", fromBlock: 73057898, permitFailure: true },
    sonic: { factory: "0x777fAca731b17E8847eBF175c94DbE9d81A8f630", fromBlock: 514659, permitFailure: true },
  },
  "prism-dex": {
    methodology: "Counts TVL from all Uniswap V3 pools deployed via the factory contract at 0x1adb8f973373505bb206e0e5d87af8fb1f5514ef",
    start: 7845865,
    megaeth: { factory: "0x1adb8f973373505bb206e0e5d87af8fb1f5514ef", fromBlock: 7845865 },
  },
  "superswap-v3": {
    methodology: "TVL accounts for the liquidity on all AMM pools taken from the factory contract",
    optimism: { factory: "0xe52a36Bb76e8f40e1117db5Ff14Bd1f7b058B720", fromBlock: 124982239 },
  },
  "summitx-finance": { // v3Config
    methodology: 'TVL is calculated by summing the token balances in all SummitX V3 pools on Camp Network using the standard Uniswap V3 helper functions for accurate pricing.',
    camp: { factory: '0xBa08235b05d06A8A27822faCF3BaBeF4f972BF7d', fromBlock: 1 },
  },
  "stationdex-v3": {
    deadFrom: "2025-01-01",
    xlayer: { factory: '0xA7c6d971586573CBa1870b9b6A281bb0d5f853bC', fromBlock: 451069 },
  },
}

module.exports = buildProtocolExports(uniV3Configs, uniV3Export)
