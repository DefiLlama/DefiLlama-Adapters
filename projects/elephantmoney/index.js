const sdk = require("@defillama/sdk")
const ethers = require('ethers')
const _ = require('underscore')
const BigNumber = require('bignumber.js')
const { pool2s } = require("../helper/pool2")
const { transformBscAddress } = require("../helper/portedTokens")


const ELEPHANTWBNBLP = '0x1CEa83EC5E48D9157fCAe27a19807BeF79195Ce1'
const ELEPHANTBUSDLP = '0x647bc907d520C3f63bE38d01DBd979f5606beC48'
const ELEPHANTTOKEN = '0xE283D0e3B8c102BAdF5E8166B73E02D96d92F688'
const TRUNKTOKEN = '0xdd325C38b12903B727D16961e61333f4871A70E0'
const ELEPHANT_WBNB_LP = "0x1CEa83EC5E48D9157fCAe27a19807BeF79195Ce1"
const ELEPHANT_BUSD_LP = "0x647bc907d520C3f63bE38d01DBd979f5606beC48"
const TRUNK_BUSD_LP = "0xf15A72B15fC4CAeD6FaDB1ba7347f6CCD1E0Aede"
const BUSD_TREASURY = "0xCb5a02BB3a38e92E591d323d6824586608cE8cE4"

const lpContracts = [
  ELEPHANTTOKEN,
  TRUNKTOKEN
];
const lpAddresses = [
  ELEPHANTWBNBLP,
  ELEPHANTBUSDLP,
  TRUNK_BUSD_LP
];

let coins = {
  //token addresses
  ELEPHANT: "0xE283D0e3B8c102BAdF5E8166B73E02D96d92F688",
  TRUNK: "0xdd325C38b12903B727D16961e61333f4871A70E0",
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56"
}

let busd_addresses = [
  ELEPHANT_BUSD_LP,
  TRUNK_BUSD_LP,
  BUSD_TREASURY,
]

/**
* TVLCALC
* = toUSD('WBNB', WBNB.balanceOf(ELEPHANT_WBNB_LP)) 
* + toUSD('BUSD', BUSD.balanceOf(ELEPHANT_BUSD_LP) + BUSD.balanceOf(TRUNK_BUSD_LP) + BUSD.balanceOf(BUSD_TREASURY))
* + toUSD('ELEPHANT', WBNB.totalSupply()) + toUSD('TRUNK', WBNB.totalSupply())
*/

async function tvl(timestamp, block) {
  const balances = {};
  const transform = await transformBscAddress();
  
  const wbnbBal = await sdk.api.erc20.balanceOf({ target: coins.WBNB, owner: ELEPHANT_WBNB_LP, block, chain: 'bsc' })
  sdk.util.sumSingleBalance(balances, transform(coins.WBNB), wbnbBal.output);

  for (const address of busd_addresses) {
    const bal = await sdk.api.erc20.balanceOf({ target: coins.BUSD, owner: address, block , chain: 'bsc'})
    sdk.util.sumSingleBalance(balances, transform(coins.BUSD), bal.output);
  }

  const elephantTotalSupply = await sdk.api.erc20.totalSupply({target:coins.ELEPHANT, block, chain: 'bsc'})
  sdk.util.sumSingleBalance(balances, transform(coins.ELEPHANT), elephantTotalSupply.output)

  const trunkTotalSupply = await sdk.api.erc20.totalSupply({target:coins.TRUNK, block, chain: 'bsc'})
  sdk.util.sumSingleBalance(balances, transform(coins.TRUNK), trunkTotalSupply.output)


  return balances;
}


module.exports = {
  name: 'Elephant Money',
  token: 'ELEPHANT',
  website: 'https://elephant.money/',
  bsc: {
    pool2: pool2s(lpContracts, lpAddresses, "bsc"),
    tvl: tvl,
  }
}