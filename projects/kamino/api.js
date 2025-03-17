const { Kamino } = require('@kamino-finance/kliquidity-sdk')
const { getConnection, } = require('../helper/solana')

async function tvl() {
  throw new Error('Using rpc proxy now')
  const kamino = new Kamino('mainnet-beta', getConnection());
  const shareData = await kamino.getStrategiesShareData({});
  return {
    tether: shareData.reduce((a, i) => a + i.shareData.balance.computedHoldings.totalSum.toNumber(), 0)
  };
}

module.exports = {
  solana: { tvl },
};
