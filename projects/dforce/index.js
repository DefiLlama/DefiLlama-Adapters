const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

const BigNumber = require('bignumber.js');
const abi = {
    "getBaseData": "function getBaseData() returns (uint256, uint256, uint256, uint256, uint256)",
    "balanceOfUnderlying": "function balanceOfUnderlying(address _account) view returns (uint256)",
    "balanceOf": "function balanceOf(address account) view returns (uint256)",
    "totalSupply": "uint256:totalSupply",
    "exchangeRateCurrent": "uint256:exchangeRateCurrent",
    "underlying": "address:underlying",
    "getUnderlyingPrice": "function getUnderlyingPrice(address _asset) view returns (uint256)",
    "getAlliTokens": "address[]:getAlliTokens",
    "isiToken": "bool:isiToken",
    "getCurrentExchangeRate": "uint256:getCurrentExchangeRate",
    "oracle": "address:priceOracle"
  };
const BASE = BigNumber(10 ** 18)
const { compoundExports2 } = require('../helper/compound')


const PAX = "0x8E870D67F660D95d5be530380D0eC0bd388289E1";
const TUSD = ADDRESSES.ethereum.TUSD;
const USDC = ADDRESSES.ethereum.USDC;

/*==================================================
  USDx
  ==================================================*/
const usdxReservedTokens = [PAX, TUSD, USDC];
const usdxPool = "0x7FdcDAd3b4a67e00D9fD5F22f4FD89a5fa4f57bA"; // USDx Stablecoin Pool


/*==================================================
  GOLDx Protocol
  ==================================================*/
const goldxReserve = "0x45804880De22913dAFE09f4980848ECE6EcbAf78"; // PAXG
const goldxProtocol = "0x355C665e101B9DA58704A8fDDb5FeeF210eF20c0"; // GOLDx

let allControllers = {
  ethereum: [
    "0x1E96e916A64199069CcEA2E6Cf4D63d30a61b93d", // dForce vault pool: USX/3CRV
    "0x8f1f15DCf4c70873fAF1707973f6029DEc4164b3", // liqee general pool
  ],
  bsc: [
    "0x6d290f45A280A688Ff58d095de480364069af110" // liqee general pool
  ],
  arbitrum: [
    "0x50210A88217d1dD9e7FBc3E4a927Cc55829a38eB", // dForce vault pool: USX/2CRV
    "0xcfe6d1b2BE777f20AD6F98f1c12C6436652F2031", // dForce vault pool: iwstETH
    "0xB5b3da79789dE012Fd75108138b2315E5645715A", // dForce vault pool: saETH
  ],
  optimism: ["0xdF0e115aA822443df9200Cc5d0260FA8E1aF06F5"], // dForce vault pool: iwstETH
  polygon: [],
  avax: ["0x078ad8d6faeD9DAeE55f5d446C80E0C81230DE6b"],
  kava: ["0xFBf64A8cAEA1D641affa185f850dbBF90d5c84dC"],
  conflux: []
};

let yieldMarkets = {
  ethereum: [
    "0x02285AcaafEB533e03A7306C55EC031297df9224", // dDAI
    "0x109917F7C3b6174096f9E1744e41ac073b3E1F72", // dUSDx
    "0x16c9cF62d8daC4a38FB50Ae5fa5d51E9170F3179", // dUSDC
    "0x868277d475E0e475E38EC5CdA2d9C83B5E1D9fc8" // dUSDT
  ],
  bsc: [
    "0xce14792a280b20c4f8E1ae76805a6dfBe95729f5", // dBUSD
    "0x4E0B5BaFC52D09A8F18eA0b7a6A7dc23A1096f99", // dDAI
    "0x6c0F322442D10269Dd557C6e3A56dCC3a1198524", // dUSDC
    "0x6199cC917C12E4735B4e9cEfbe29E9F0F75Af9E5" // dUSDT
  ]
};

const excludeAlliTokens = {
  ethereum: [
    "0x1adc34af68e970a93062b67344269fd341979eb0", // General pool USX
    "0x44c324970e5cbc5d4c3f3b7604cbc6640c2dcfbf", // General pool EUX
    "0xb986f3a2d91d3704dc974a24fb735dcc5e3c1e70", // General pool EUX
    "0xf54954ba7e3cdfda23941753b48039ab5192aea0", // Stock pool USX
    "0xab9c8c81228abd4687078ebda5ae236789b08673", // Stock pool EUX
    "0xa5d65e3bd7411d409ec2ccfa30c6511ba8a99d2b", // Liqee qUSX
    "0x4c3f88a792325ad51d8c446e1815da10da3d184c" // Liqee iMUSX
  ],
  // Optimism
  optimism: [
    "0x7e7e1d8757b241aa6791c089314604027544ce43" // iUSX
  ],
  // BNB-Chain
  bsc: [
    "0x463e3d1e01d048fdf872710f7f3745b5cdf50d0e",
    "0x367c17d19fcd0f7746764455497d63c8e8b2bba3",
    "0x20ecc92f0a33e16e8cf0417dfc3f586cf597f3a9",
    "0xb5102cee1528ce2c760893034a4603663495fd72", // iUSX
    "0x7b933e1c1f44be9fb111d87501baada7c8518abe", // General pool USX
    "0x983a727aa3491ab251780a13acb5e876d3f2b1d8", // General pool EUX
    "0x911f90e98d5c5c3a3b0c6c37bf6ea46d15ea6466", // Stock pool USX
    "0x8af4f25019e00c64b5c9d4a49d71464d411c2199", // Stock pool EUX
    "0x450e09a303aa4bcc518b5f74dd00433bd9555a77", // Liqee qUSX
    "0xee0d3450b577743eee2793c0ec6d59361eb9a454" // Liqee iMUSX
  ],
  // Polygon
  polygon: [
    "0xc171ebe1a2873f042f1dddd9327d00527ca29882", // iUSX
    "0x448bbbdb706cd0a6ab74fa3d1157e7a33dd3a4a8"
  ],
  // Arbitrum
  arbitrum: [
    "0x0385f851060c09a552f1a28ea3f612660256cbaa", // iUSX
    "0x5675546eb94c2c256e6d7c3f7dcab59bea3b0b8b", // iEUX
    "0xc2125882318d04d266720b598d620f28222f3abd" // iEUX
  ],
  avax: [
    "0x73c01b355f2147e5ff315680e068354d6344eb0b" // iUSX
  ],
  kava: [
    "0x9787af345e765a3fbf0f881c49f8a6830d94a514" // iUSX
  ],
  conflux: [
    "0x6f87b39a2e36F205706921d81a6861B655db6358" // iUSX
  ]
};

// DF staking pool: sDF
const dfStakingPools = "0x41602ccf9b1F63ea1d0Ab0F0A1D2F4fd0da53f60";

const USXs = {
  "ethereum": ADDRESSES.ethereum.USX,
  "bsc": "0xb5102cee1528ce2c760893034a4603663495fd72",
  "arbitrum": "0x641441c631e2f909700d2f41fd87f0aa6a6b4edb",
  "polygon": "0xCf66EB3D546F0415b368d98A95EAF56DeD7aA752",
  "avax": "0x853ea32391AaA14c112C645FD20BA389aB25C5e0",
  "kava": ADDRESSES.kava.USX,
  "conflux": "0x422a86f57b6b6F1e557d406331c25EEeD075E7aA"
};

async function getDFStakingValue(block) {
  // Mainnet DF
  const DF = "0x431ad2ff6a9C365805eBaD47Ee021148d6f7DBe0";

  const { output: stakingExchangeRate } = await sdk.api.abi.call({
    block,
    target: dfStakingPools,
    abi: abi["getCurrentExchangeRate"],
    chain: "ethereum"
  });

  const { output: stakingTotalSupply } = await sdk.api.abi.call({
    block,
    target: dfStakingPools,
    abi: abi["totalSupply"],
    chain: "ethereum"
  });

  const lockedDF = BigNumber(stakingExchangeRate.toString()).times(BigNumber(stakingTotalSupply.toString())).div(BASE);

  return {
    [DF]: lockedDF
  };
}

async function getTVLOfdToken(api) {
  let dTokens = yieldMarkets[api.chain];
  if (!dTokens) return;
  const uTokens = await api.multiCall({ abi: 'address:token', calls: dTokens })
  const bals = await api.multiCall({ abi: 'uint256:getTotalBalance', calls: dTokens })
  api.add(uTokens, bals)
}

function getTVLByChain(chain) {
  return async (api) => {
    if (chain == "ethereum") {
      const ownerTokens = [[usdxReservedTokens, usdxPool], [[goldxReserve], goldxProtocol]]
      await api.sumTokens({ ownerTokens })
    }

    await getTVLOfdToken(api);
    return api.getBalances()
  }
}

function getLendingTvl(chain, borrowed) {
  const controllers = allControllers[chain]
  const blacklistedTokens = excludeAlliTokens[chain]
  if (USXs[chain])
    blacklistedTokens.push(USXs[chain])
  if (yieldMarkets[chain])
    blacklistedTokens.push(...yieldMarkets[chain])

  const res = controllers.map(comptroller => compoundExports2({
    comptroller, abis: { getAllMarkets: abi['getAlliTokens'] }, blacklistedTokens,
  })).map(i => borrowed ? i.borrowed : i.tvl)
  if (!borrowed)
    res.push(getTVLByChain(chain))
  return sdk.util.sumChainTvls(res)
}

function chainTvl(chain) {
  return {
    tvl: getLendingTvl(chain, false),
    borrowed: getLendingTvl(chain, true),
  };
}

async function staking(timestamp, ethBlock, chainBlocks) {
  return getDFStakingValue(ethBlock);
}

const chains = ['ethereum', "bsc", "arbitrum", "optimism", "polygon", "avax", "kava", "conflux"]

module.exports = {
  start: '2019-07-26', // Jul-27-2019 02:17:24 AM +UTC
  hallmarks: [
    ['2023-12-19', 'Unitus spin-off'],
  ],
}
chains.forEach(chain => {
  module.exports[chain] = chainTvl(chain) 
})

module.exports.ethereum.staking = staking
