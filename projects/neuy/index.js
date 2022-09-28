const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')
const { fetchURL } = require("../helper/utils");

const neuy = {
  "ethereum": "0xa80505c408C4DEFD9522981cD77e026f5a49FE63",
  "polygon": "0x62a872d9977Db171d9e213A5dc2b782e72ca0033",
}


const lp = {
  "polygon100": "0x8574f0F28Bbd7BCfFec50B00cc4D153C564bfC05",
  "polygon10": "0x83139cf662df4fee8797Dc916EF2B5aaFE86eB16",
  "uniswapUSDC":"0x140ae14be4b5e86aa149f76e84953746e0bc04f1",
  "uniswapNEUY":"0xabebc245a9a47166ecd10933d43817c8ef6fb825",
  "uniswapNEUY2":"0xfb55e94d02d2309a62fbd2bb64c27772ae9d900a",

}

async function fetch() {

  block = (await sdk.api.util.lookupBlock(Math.floor(Date.now() / 1000), { chain: "polygon" }))
      .block;
  const lps = [
    {
      "target": neuy.polygon,
      "params": lp.polygon100
    },
    {
      "target": neuy.polygon,
      "params": lp.polygon10
    },
    {
      "target": neuy.polygon,
      "params": lp.uniswapUSDC
    },
    {
      "target": neuy.polygon,
      "params": lp.uniswapNEUY
    },
    {
      "target": neuy.polygon,
      "params": lp.uniswapNEUY2
    }
  ]
  let balances = await stakingBalanceTvl(Math.floor(Date.now() / 1000), block, "polygon", lps)
  const pricesData = (await fetchURL(
        `https://api.coingecko.com/api/v3/simple/price?ids=neuy&vs_currencies=usd`
    )).data;
    
  const amount = (Object.values(balances)[0] / Math.pow(10, 18))
  let tvl = pricesData.neuy.usd * amount;
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

module.exports = {
fetch: fetch
}