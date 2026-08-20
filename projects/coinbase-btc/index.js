const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json');
const { getReserves, reservesTvl } = require('./reserves');

async function btcTvl(api) {
  const config = await getReserves('cbbtc')
  const balances = {}
  const totalBtc = config.reserveAddresses.reduce((sum, item) => sum + parseFloat(item.balance.amount), 0)
  sdk.util.sumSingleBalance(balances, 'bitcoin', totalBtc)
  return balances
}

module.exports = {
  methodology: "TVL tracks wrapped tokens backed 1:1 by assets held by Coinbase.",
  cardano: {
    tvl: reservesTvl('cbada'),
  },
  ripple: {
    tvl: reservesTvl('cbxrp'),
  },
  bitcoin: {
    tvl: btcTvl,
  },
  litecoin: {
    tvl: reservesTvl('cbltc'),
  },
  doge: {
    tvl: reservesTvl('cbdoge'),
  },
  megaeth: {
    tvl: reservesTvl('cbmega', [ADDRESSES.megaeth.MEGA]),
  },
};
