const { call } = require("../helper/chain/ton");

const tgusdAddress = 'EQCJ7ASxOkI6Ws5Bh8J74XZbRX8861jFgTZT42DXv71-UISf'

async function tvl(api){
     const result = await call({ target: tgusdAddress, abi: "get_jetton_data"})
     return {
        "coingecko:tether": result[0]/1e6
     }
}

module.exports = {
  timetravel: false,
  start: 1746374400,
  methodology: "Telegram USD is a stablecoin on TON. The TVL is the collateral amount of USDT in the tgUSD contract.",
  ton: {
    tvl: tvl
  }
}