const { get } = require('../helper/http')

const accounts = [
  'dex',
  'lending.loan',
  'proton.swaps',
]

const cgIdMapping = {
  XXRP: 'ripple',
  XBTC: 'bitcoin',
  // XMT: 'metal', 
  XDOGE: 'dogecoin',
  XETH: 'ethereum',
  XUSDC: 'usd-coin',
  LOAN: 'proton-loan', 
  XLTC: 'litecoin',
  XUSDT: 'tether',
  // XMD: 'metal-dollar', 
  // METAL: 'metal-blockchain', 
  XHBAR: 'hedera-hashgraph',
  XSOL: 'solana'
}

async function getAccount(account) {
  const burl = 'https://api-xprnetwork-main.saltant.io'
  const res = await get(`${burl}/v2/state/get_account?limit=100&account=${account}`)
  return res.tokens
}

module.exports = {
  timetravel: false,
  xpr: {
    tvl: async () => {
      const balances = {}
      const assetBalances = (await Promise.all(accounts.map(a => getAccount(a)))).flat()
      assetBalances.map(({ symbol, amount }) => {
        if (symbol in cgIdMapping) balances[`coingecko:${cgIdMapping[symbol]}`] = amount
      })
      return balances
    }
  }
};
