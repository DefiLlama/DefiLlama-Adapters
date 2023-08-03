const ADDRESSES = require('../helper/coreAssets.json')
  const sdk = require('@defillama/sdk');

  const BigNumber = require('bignumber.js');
  const abi = require('./abi.json');
  const BASE = BigNumber(10 ** 18)
  const Double = BASE * BASE;
  const mappingTokens = require("./tokenMapping.json");
  const {sumTokensSharedOwners} = require('../helper/unwrapLPs')
  const {getCompoundV2Tvl,getCompoundUsdTvl} = require('../helper/compound')
  const {generalizedChainExports} = require('../helper/exports')


/*==================================================
  Ethereum Settings
  ==================================================*/
const DAI = ADDRESSES.ethereum.DAI;
const PAX = "0x8E870D67F660D95d5be530380D0eC0bd388289E1";
const TUSD = ADDRESSES.ethereum.TUSD;
const USDC = ADDRESSES.ethereum.USDC;
const USDT = ADDRESSES.ethereum.USDT;
const USDx = "0xeb269732ab75A6fD61Ea60b06fE994cD32a83549";

/*==================================================
  USDx
  ==================================================*/
const usdxReservedTokens = [PAX, TUSD, USDC];
const dUSDC = "0x16c9cF62d8daC4a38FB50Ae5fa5d51E9170F3179";

const usdxPool = "0x7FdcDAd3b4a67e00D9fD5F22f4FD89a5fa4f57bA"; // USDx Stablecoin Pool


/*==================================================
  GOLDx Protocol
  ==================================================*/
const goldxReserve = "0x45804880De22913dAFE09f4980848ECE6EcbAf78"; // PAXG
const goldxProtocol = "0x355C665e101B9DA58704A8fDDb5FeeF210eF20c0"; // GOLDx

/*==================================================
  BSC Settings
  ==================================================*/
const BSC_BUSD = ADDRESSES.bsc.BUSD;
const BSC_DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
const BSC_USDC = ADDRESSES.bsc.USDC;
const BSC_USDT = ADDRESSES.bsc.USDT;


let oracles = {
  ethereum: "0x34BAf46eA5081e3E49c29fccd8671ccc51e61E79",
  bsc: "0x7DC17576200590C4d0D8d46843c41f324da2046C",
  arbitrum: "0xc3FeD5f21EB8218394f968c86CDafc66e30e259A",
  optimism: "0x4f9312A21F8853384E0f6141F3F9fB855d860161",
  polygon: "0x9E8B68E17441413b26C2f18e741EAba69894767c",
  avax: "0x5237d212F9BbC83d91c2cbd810D2b07808d94f08",
  kava: "0xe04cea4d02261923769D79Dd24D188C2cB29dB4A",
  conflux: "0xfd3868B848B5D9eD3583938B4db4746415bD43a3"
};

let allControllers = {
  ethereum: [
    "0x8B53Ab2c0Df3230EA327017C91Eb909f815Ad113", // dForce general pool
    "0x1E96e916A64199069CcEA2E6Cf4D63d30a61b93d", // dForce vault pool: USX/3CRV
    "0x8f1f15DCf4c70873fAF1707973f6029DEc4164b3", // liqee general pool
  ],
  bsc: [
    "0x0b53E608bD058Bb54748C35148484fD627E6dc0A", // dForce general pool
    "0x6d290f45A280A688Ff58d095de480364069af110" // liqee general pool
  ],
  arbitrum: [
    "0x8E7e9eA9023B81457Ae7E6D2a51b003D421E5408", // dForce general pool
    "0x50210A88217d1dD9e7FBc3E4a927Cc55829a38eB", // dForce vault pool: USX/2CRV
  ],
  optimism: ["0xA300A84D8970718Dac32f54F61Bd568142d8BCF4"],
  polygon: ["0x52eaCd19E38D501D006D2023C813d7E37F025f37"],
  avax: ["0x078ad8d6faeD9DAeE55f5d446C80E0C81230DE6b"],
  kava: ["0xFBf64A8cAEA1D641affa185f850dbBF90d5c84dC"],
  conflux: ["0xA377eCF53253275125D0a150aF195186271f6a56"]
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

let yieldUnderlyingTokens = {
  ethereum: {
    "0x02285AcaafEB533e03A7306C55EC031297df9224": DAI,
    "0x109917F7C3b6174096f9E1744e41ac073b3E1F72": USDx,
    "0x16c9cF62d8daC4a38FB50Ae5fa5d51E9170F3179": USDC,
    "0x868277d475E0e475E38EC5CdA2d9C83B5E1D9fc8": USDT
  },
  bsc: {
    "0xce14792a280b20c4f8E1ae76805a6dfBe95729f5": BSC_BUSD,
    "0x4E0B5BaFC52D09A8F18eA0b7a6A7dc23A1096f99": BSC_DAI,
    "0x6c0F322442D10269Dd557C6e3A56dCC3a1198524": BSC_USDC,
    "0x6199cC917C12E4735B4e9cEfbe29E9F0F75Af9E5": BSC_USDT
  }
};

const excludeAlliTokens = {
  ethereum: [
    "0x1adc34af68e970a93062b67344269fd341979eb0", // General pool USX
    "0x44c324970e5cbc5d4c3f3b7604cbc6640c2dcfbf", // General pool EUX
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
    "0x7b933e1c1f44be9fb111d87501baada7c8518abe", // General pool USX
    "0x983a727aa3491ab251780a13acb5e876d3f2b1d8", // General pool EUX
    "0x911f90e98d5c5c3a3b0c6c37bf6ea46d15ea6466", // Stock pool USX
    "0x8af4f25019e00c64b5c9d4a49d71464d411c2199", // Stock pool EUX
    "0x450e09a303aa4bcc518b5f74dd00433bd9555a77", // Liqee qUSX
    "0xee0d3450b577743eee2793c0ec6d59361eb9a454" // Liqee iMUSX
  ],
  // Polygon
  polygon: [
    "0xc171ebe1a2873f042f1dddd9327d00527ca29882" // iUSX
  ],
  // Arbitrum
  arbitrum: [
    "0x0385f851060c09a552f1a28ea3f612660256cbaa", // iUSX
    "0x5675546eb94c2c256e6d7c3f7dcab59bea3b0b8b" // iEUX
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
    [DF]:lockedDF
  };
}

async function getUnderlyingPrice(chain, token, block) {
  const { output: iTokenPrices } = await sdk.api.abi.call({
    block,
    target: oracles[chain],
    params: mappingTokens[token] ? mappingTokens[token] : token,
    abi: abi["getUnderlyingPrice"],
    chain: chain
  });

  return iTokenPrices;
}

async function getTVLOfdToken(chain, block, dTokenBalances) {
  let dTokenTVL = BigNumber("0");
  let dTokens = yieldMarkets[chain];
  let dTokenUnderlyings = yieldUnderlyingTokens[chain];
  await
  Promise.all(dTokens.map(async dToken => {
      let { output: marketTVL } = await sdk.api.abi.call({
        block,
        target: dToken,
        abi: abi["getBaseData"],
        chain: chain
      });

      const _balance = marketTVL["4"] || 0;

      dTokenBalances[dTokenUnderlyings[dToken]] = _balance;

      let assetPrice = await getUnderlyingPrice(chain, dTokenUnderlyings[dToken], block);

      dTokenTVL = dTokenTVL.plus(BigNumber(_balance).times(BigNumber(assetPrice)).div(Double)
      )})
  );

  return {
    dTokenBalances,
    dTokenTVL
  };
}

function getTVLByChain(chain) {
  return async (time, ethBlock, chainBlocks) => {
    const block = chainBlocks[chain];
    const balances = {};
    if (chain == "ethereum") {
      // 1. get balance and tvl of the USDx token.
      await sumTokensSharedOwners(balances, usdxReservedTokens, [usdxPool], block, chain)
      // 2. get backing of GOLDx token.
      await sumTokensSharedOwners(balances, [goldxReserve], [goldxProtocol], block, chain)
    }

    if (chain === "ethereum" || chain === "bsc") {
      // 3. get balance and tvl of the dToken protocol.
      let {
        dTokenBalances: dTokenDetails,
        dTokenTVL: dTokenTVL
      } = await getTVLOfdToken(chain, block, balances);
    }

    return balances
  }
}

function getLendingTvl(chain, borrowed){
  return sdk.util.sumChainTvls(allControllers[chain].map(controller =>
    getCompoundUsdTvl(controller, chain, "0x5ACD75f21659a59fFaB9AEBAf350351a8bfaAbc0", borrowed,
      {
        oracle: abi['oracle'],
        underlyingPrice: abi['getUnderlyingPrice'],
        getAllMarkets: abi['getAlliTokens']
      }, {
      blacklist: excludeAlliTokens[chain].concat([USXs[chain] ?? ""]),
    })
  ))
}

function chainTvl(chain) {
  return {
    tvl: sdk.util.sumChainTvls([getLendingTvl(chain, false), getTVLByChain(chain)]),
    borrowed: getLendingTvl(chain, true),
  };
}

async function staking(timestamp, ethBlock, chainBlocks) {
  return getDFStakingValue(ethBlock);
}

module.exports = {
  ethereum: {
    ...chainTvl("ethereum"),
    staking,
  },
  ...generalizedChainExports(chainTvl, ["bsc", "arbitrum", "optimism", "polygon", "avax", "kava", "conflux"]),
  start: 1564165044, // Jul-27-2019 02:17:24 AM +UTC
}
