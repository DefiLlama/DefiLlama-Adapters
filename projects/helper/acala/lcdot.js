const { getWallet } = require('./api')


async function staking(chain) {
  const wallet = await getWallet(chain)
  const supply = await wallet.getIssuance('lc://13')
  const price = await wallet.getPrice('DOT')

  return  {
    tether: supply.times(price).toNumber()
  }
}

module.exports = {
  staking,
}