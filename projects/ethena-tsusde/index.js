const { call } = require("../helper/chain/ton");


const vauldWalletAddress = 'EQC47kTbsuZTXAs-rgegRvg3nwNCyqKp5bVZZqrncyV8xVk5'

async function tvl(api){
     const result = await call({ target: vauldWalletAddress, abi: "get_wallet_data"})
     return {
        "coingecko:tether": result[0]/1e6
     }
}

module.exports = {
  timetravel: false,
  methodology: "USDe is locked on the vault smart contract (EQChGuD1u0e7KUWHH5FaYh_ygcLXhsdG2nSHPXHW8qqnpZXW)",
  ton: {
    tvl: tvl
  }
}