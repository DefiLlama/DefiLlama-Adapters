const { sumTokens } = require('../helper/chain/bitcoin')
const { getConfig } = require('../helper/cache')

async function tvl(api) {
  const { wallets } = await getConfig('tbtc/wallets', 'https://api.threshold.network/tbtc/wallets/pof')
  const owners = wallets.filter(i => +i.walletBitcoinBalance > 0).map(wallet => wallet.walletBitcoinAddress)
  return sumTokens({ owners, })
}

module.exports = {
  timetravel: false,
  methodology: "BTC on btc chain",
  ethereum: { tvl: () => ({}) },
  bitcoin: {
    tvl,
  },
};
