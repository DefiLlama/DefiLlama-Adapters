const ABI = require("./Helper.json");
const sdk = require("@defillama/sdk");
const chain = 'klaytn'

const { toUSDTBalances } = require("../helper/balances");
const BigNumber = require("bignumber.js");

const HELPER_ADDR = "0x2b170005ADA0e616E78A7fa93ea4473c03A98aa0";

const KLAYSWAP_POOLS = [
  {
    poolname: `KLAYKOKOA`,
    address: `0x53FE8c456C470A7214ed5caAd88c486449f3b196`,
    decimal: 18
  },
  {
    poolname: `AKLAYKOKOA`,
    address: `0x42cA952604ec07293ee463f6c5444C63339D53A0`,
    decimal: 18
  }
];

const KOKONUT_POOLS = [
  // {
  //   poolname: 'KLAYKSD',
  //   address: `0xc513524FDE442f2763c2A2Ba31D9A5c13Bcbab7b`,
  //   decimal: 18
  // },
  {
    poolname: 'AKLAYKSD',
    address: `0xB07D6D2534BfF886589064cc77CE025f2F61641a`,
    decimal: 18
  },
  {
    poolname: `KSD4EYE`,
    address: `0xa3A991273Ff9B1B9E0C2fD5e595830890F55D133`,
    decimal: 18
  }
]

const fetchCollateral = async (ts, _block, chainBlocks) => {
  const block = chainBlocks[chain]
  //calculate TVL sum of all collaterals locked in the protocol vaults
  const decimal = 18;

  var sum = new BigNumber(0);
  const { output: assetTvlLists } = await sdk.api.abi.call({
    chain, block,
    target: HELPER_ADDR,
    abi: ABI.abi.find(i => i.name === 'getCollateralTVL')
  })
  for (let assetTvl of assetTvlLists) {
    sum = sum.plus(assetTvl);
  }
  sum = sum.dividedBy(BigNumber(10).pow(decimal * 2))
  return toUSDTBalances(sum.toFixed(2));
}

const fetchPool2 = async (ts, _block, chainBlocks) => {
  const block = chainBlocks[chain]
  const decimal = 18;

  let klayswapPool2Tvl = BigNumber(0);
  for (let pool of KLAYSWAP_POOLS) {
    const { output: value } = await sdk.api.abi.call({
      chain, block,
      target: HELPER_ADDR,
      params: [pool[`address`]],
      abi: ABI.abi.find(i => i.name === 'getKlayswapLpFarmTVL')
    })
    klayswapPool2Tvl = klayswapPool2Tvl.plus(value);
  }
  let kokonutPool2Tvl = BigNumber(0);
  for (let pool of KOKONUT_POOLS) {
    const { output: value } = await sdk.api.abi.call({
      chain, block,
      target: HELPER_ADDR,
      params: [pool[`address`]],
      abi: ABI.abi.find(i => i.name === 'getKokonutLpFarmTVL')
    })
    kokonutPool2Tvl = kokonutPool2Tvl.plus(value);
  }
  const totalPool2 = klayswapPool2Tvl.plus(kokonutPool2Tvl).dividedBy(BigNumber(10 ** (decimal * 2)));
  return toUSDTBalances(totalPool2.toFixed(2));
}

const fetchStakedToken = async (ts, _block, chainBlocks) => {
  const block = chainBlocks[chain]
  //staked token prices are calculated using real-time KOKOA price from KLAY-KOKOA LP

  let { output: skokoaTvl } = await sdk.api.abi.call({
    chain, block,
    target: HELPER_ADDR,
    abi: ABI.abi.find(i => i.name === 'getSkokoaTVL')
  })
  const decimal = 18;
  skokoaTvl = BigNumber(skokoaTvl).dividedBy(BigNumber(10).pow(decimal * 2));
  return toUSDTBalances(BigNumber(skokoaTvl).toFixed(2));
}


module.exports = {
  klaytn: {
    staking: fetchStakedToken,
    tvl: fetchCollateral,
    pool2: fetchPool2
  },
  methodology:
    "tvl is calculated using the total collateral value locked in the protocol. Staked tokens include staked kokoa value. Pool2 includes staked LP tokens"
}