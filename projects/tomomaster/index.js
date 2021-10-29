const axios = require("axios");

async function tvl() {
    var lockedTomo = await axios.get('https://tomoscan.io/api/account/0x0000000000000000000000000000000000000088')
    var tomoPrice = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=TOMOUSDT')
    return {
        'tomochain': parseFloat(lockedTomo.data.balanceNumber) * parseFloat(tomoPrice.data.price) || 0
    }
}

module.exports = {
    tvl,
    methodology: `To obtain the TomoMaster TVL we get locked TOMO from TomoValidator contract and TOMO price from Binance.com (the largest liquidity exchange of TOMO) then calculate TVL value`,
  }