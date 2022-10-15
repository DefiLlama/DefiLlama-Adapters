const { getWallet } = require('./api')


async function staking(chain) {
  const wallet = await getWallet(chain)
  const supply = await wallet.getIssuance('lc://13')

  return  {
    polkadot: supply.toNumber()
  }
}

module.exports = {
  staking,
}