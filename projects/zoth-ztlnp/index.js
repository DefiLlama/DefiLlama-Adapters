const { getLogs } = require('../helper/cache/getLogs')

const ZTLN_P = '0xfEd3D6557Dc46A1B25d0A6F666513Cb33835864B'

const eventAbis = {
  deposit: "event Deposit(address investor, address asset, uint256 amount, uint256 shares)",
  processRedemption: "event ProcessRedemption(address investor, uint256 shares, address asset, uint256 amount)"
}

const tvl = async (api) => {
  const [deposit_logs, redeem_logs] = await Promise.all([
    getLogs({ api, extraKey: 'zoth-deposit', fromBlock: 21379903, target: ZTLN_P, onlyArgs: true, eventAbi: eventAbis.deposit }),
    getLogs({ api, extraKey: 'zoth-redeem', fromBlock: 21379903, target: ZTLN_P, onlyArgs: true, eventAbi: eventAbis.processRedemption })
  ])

  deposit_logs.forEach(([_investor, asset, amount, _shares]) => api.add(asset, amount))
  redeem_logs.forEach(([_investor, _shares, asset, amount]) => api.add(asset, -amount))
}

module.exports = {
  ethereum: { tvl }
}