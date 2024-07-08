const ADDRESSES = require('../helper/coreAssets.json')

const stellar_assets = [
  {ticker:'WTSY', address:'GB3ZUC7FGDEEBXY3BDEJWMPNGBFA66YRI4QQT6PBO3ZT6F33S7RL36VF'},
  {ticker:'WTTS', address:'GBBV5CF7UPA2PYRPA632URLB55BWML7X4H33ZRCDWMTULOXDGPHJR5VI'},
  {ticker:'TIPS', address:'GAJ4KSYLVBJKQ4UBPKJJXPYWVIRZWVTIYRMHBXTHGCDS4XJXXYEUALVD'},
  {ticker:'WTST', address:'GDEBI5X7J4IDXCSVV3KPFZIHQRCBVF3DAZMS5H7KYOBK45T6XYGDE77P'},
  {ticker:'WTLG', address:'GAK7PE7DD4ZRJQN3VBCQFBKFV53JGUM2SQATQAKLFK6MVONPGNYK34XH'}
]

const tvl = async (api) => {
  const responses = await Promise.all(stellar_assets.map(async ({ticker, address}) => {
    const api = `https://api.stellar.expert/explorer/public/asset/${ticker}-${address}`
    const response = await fetch(api)
    return response.json()
  }))

  responses.forEach(({supply}) => {
    api.add(ADDRESSES.ethereum.USDC, supply, { skipChain: true })
  })
}

module.exports = {
  stellar: {tvl},
}
