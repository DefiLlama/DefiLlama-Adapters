const utils = require('./helper/utils');
const web3 = require('./config/web3.js')

async function fetch() {

    var tokens = ['0x39AA39c021dfbaE8faC545936693aC917d5E7563',
    '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643']

    var pool1 = '0x35101c731b1548B5e48bb23F99eDBc2f5c341935';
    var pool2 = '0x66be1bc6C6aF47900BBD4F3711801bE6C2c6CB32';
    var pool3 = '0x83D0D842e6DB3B020f384a2af11bD14787BEC8E7';

    let price_feed = await utils.getPricesfromString('ethereum,cdai,compound-usd-coin');

    var tvl = 0;
    await Promise.all(
      tokens.map(async (token) => {
          let poolAmount = await utils.returnBalance(token, pool1)
          if (token === '0x39AA39c021dfbaE8faC545936693aC917d5E7563') {
            tvl += (poolAmount * price_feed.data.cdai.usd)
          } else {
            tvl += (poolAmount * price_feed.data['compound-usd-coin'].usd)
          }
      })
    )

    var poolAmount2 = await utils.returnEthBalance(pool2);
    tvl += (poolAmount2 * price_feed.data.ethereum.usd)
    var poolAmount3 = await utils.returnEthBalance(pool3);
    tvl += (poolAmount3 * price_feed.data.ethereum.usd)
    return tvl;
}


module.exports = {
  fetch
}
