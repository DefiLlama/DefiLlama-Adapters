const { Kamino } = require('@hubbleprotocol/kamino-sdk')
const { getConnection, } = require('../helper/solana')

async function tvl() {
  const kamino = new Kamino('mainnet-beta', getConnection());
  const shareData = await kamino.getStrategiesShareData({});
  return {
    tether: shareData.reduce((a, i) => a + i.shareData.balance.computedHoldings.totalSum.toNumber(), 0)
  };
}

module.exports = {
  solana: { tvl },
};
