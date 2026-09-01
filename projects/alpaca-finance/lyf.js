const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')

async function getProcolAddresses(chain) {
  if (chain == 'bsc') {
    return (
      await getConfig('alpaca-finance/lyf-bsc',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.mainnet.json"
      )
    )
  }
  if (chain == 'fantom') {
    return (
      await getConfig('alpaca-finance/lyf-fantom',
        "https://raw.githubusercontent.com/alpaca-finance/bsc-alpaca-contract/main/.fantom_mainnet.json"
      )
    )
  }
}

async function calLyfTvl(api) {
  const chain = api.chain;
  const addresses = await getProcolAddresses(chain);
  const vaults = addresses["Vaults"].map(i => i.address)
  const tokens = await api.multiCall({ abi: 'address:token', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:totalToken', calls: vaults })
  api.add(tokens, bals)
  api.removeTokenBalance(ADDRESSES.bsc.BTCB)
  return api.getBalances()
}

module.exports = {
  calLyfTvl,
  getProcolAddresses
}
