const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')
const { fetchURL } = require("../helper/utils");

const { staking } = require("../helper/staking");

const neuy = {
  "ethereum": "0xa80505c408C4DEFD9522981cD77e026f5a49FE63",
  "polygon": "0x62a872d9977Db171d9e213A5dc2b782e72ca0033",
}

const ethLP = {
  "ethereum100": "0x83833e3c5363b51db01e74ccc97e98a09ce86dcc",
  "ethereum10": "0x82bcd0c19acb970a75771b370f2a3adea1702a44",
}

const polyLP = {
  "polygon100": "0x8574f0F28Bbd7BCfFec50B00cc4D153C564bfC05",
  "polygon10": "0x83139cf662df4fee8797Dc916EF2B5aaFE86eB16",
}

async function eth() {

  ethBlock = (await sdk.api.util.lookupBlock(Math.floor(Date.now() / 1000), { chain: "ethereum" }))
      .block;
  const ethLPS = [
    {
      "target": neuy.ethereum,
      "params": ethLP.ethereum100
    },
    {
      "target": neuy.ethereum,
      "params": ethLP.ethereum10
    }
  ]
  let ethBalances = await stakingBalanceTvl(Math.floor(Date.now() / 1000), ethBlock, "ethereum", ethLPS)
  const pricesData = (await fetchURL(
        `https://api.coingecko.com/api/v3/simple/price?ids=neuy&vs_currencies=usd`
    )).data;
    
  amount = (Object.values(ethBalances)[0] / Math.pow(10, 18))
  let tvl = pricesData.neuy.usd * amount;
  tvl = Math.round(tvl * 100) / 100.0;
  console.log(tvl);
  return tvl;
}

async function poly() {

  polyBlock = (await sdk.api.util.lookupBlock(Math.floor(Date.now() / 1000), { chain: "polygon" }))
      .block;
  const polyLPS = [
    {
      "target": neuy.polygon,
      "params": polyLP.polygon100
    },
    {
      "target": neuy.polygon,
      "params": polyLP.polygon10
    }
  ]
  let polyBalances = await stakingBalanceTvl(Math.floor(Date.now() / 1000), polyBlock, "polygon", polyLPS)
  const pricesData = (await fetchURL(
        `https://api.coingecko.com/api/v3/simple/price?ids=neuy&vs_currencies=usd`
    )).data;
    
  amount = (Object.values(polyBalances)[0] / Math.pow(10, 18))
  let tvl = pricesData.neuy.usd * amount;
  tvl = Math.round(tvl * 100) / 100.0;
  console.log(tvl);
  return tvl;
}

async function stakingBalanceTvl(timestamp, block, chain, lps) {
  const balancesOfResult = await sdk.api.abi.multiCall({
    calls: lps.map((lp) => ({
      target: lp.target,
      params: lp.params
    })),
    abi: 'erc20:balanceOf',
    block,
    chain
  })
  let balances = {}
  sdk.util.sumMultiBalanceOf(balances, balancesOfResult);
  return balances
}

async function fetch() {
  let polyAmount = await poly();
  let ethAmount = await eth();
  return polyAmount + ethAmount;
}

module.exports = {
 fetch: fetch,
 ethereum: {
    tvl: () => ({}),
    staking: staking(ethLP.ethereum100, neuy.ethereum, 'ethereum'),
    staking: staking(ethLP.ethereum10, neuy.ethereum, 'ethereum')
  },
 polygon: {
    tvl: () => ({}),
    staking: staking(polyLP.polygon100, neuy.polygon, 'polygon'),
    staking: staking(polyLP.polygon10, neuy.polygon, 'polygon')
  }
} 