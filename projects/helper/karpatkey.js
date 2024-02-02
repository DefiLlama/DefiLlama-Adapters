const { sumSingleBalance } = require("@defillama/sdk/build/generalUtil")
const { fetchURL } = require("./utils")

const symbolToId = {
    "BAL":"balancer",
    "DAI":"dai",
    "ETH":"ethereum",
    "USDC":"usd-coin",
    "USDT":"tether",
    "WBTC":"bitcoin",
    "WETH":"ethereum",
    "rETH2":"reth2",
    "stETH":"staked-ether",
    "sETH2":"seth2",
    "rETH": "rocket-pool-eth",
    "ankrETH":"ankreth",
    "cbETH":"coinbase-wrapped-staked-eth",
    "ETHx": "stader-ethx",
    "GNO": "gnosis",
    wstETH: "wrapped-steth",
    WXDAI: "dai",
    XDAI: "dai"
}

async function karpatKeyTvl(timestamp, daoName, tokenToExclude) {
  const {data} = await fetchURL("https://aumapi.karpatkey.dev/our_daos_token_details")
  let date = new Date(timestamp*1e3)
  let monthlyData = data.tokens.filter(t=>t.year_month === `${date.getFullYear()}_${date.getMonth()+1}` && t.dao === daoName)
  if(monthlyData.length === 0){
    date = new Date(date - 30*24*3600e3)
    monthlyData = data.tokens.filter(t=>t.year_month === `${date.getFullYear()}_${date.getMonth()+1}` && t.dao === daoName)
  }
  const balances = {}
  monthlyData.forEach(bal=>{
    if(symbolToId[bal.token_symbol] && tokenToExclude !== bal.token_symbol){
        sumSingleBalance(balances, symbolToId[bal.token_symbol], bal.token_balance)
    } else {
        console.log(`Skipping ${bal.token_symbol}`)
    }
  })
  return balances
}

module.exports={
    karpatKeyTvl
}