const factory = '0x05f0fEE5b8460a773872f8e4e9D23aE109BB3592'
const deploymentBlock = 116603318

async function tvl(api) {
  if (await api.getBlock() < deploymentBlock) return

  const markets = await api.fetchList({
    target: factory,
    lengthAbi: 'uint256:marketCount',
    itemAbi: 'function markets(uint256) view returns (address)',
  })
  if (!markets.length) return

  const [collaterals, adapters] = await Promise.all([
    api.multiCall({ abi: 'address:token', calls: markets }),
    api.multiCall({ abi: 'address:core', calls: markets }),
  ])
  const vaults = await api.multiCall({ abi: 'address:vault', calls: adapters })

  return api.sumTokens({
    tokensAndOwners: markets.flatMap((market, i) => [
      [collaterals[i], market],
      [collaterals[i], vaults[i]],
    ]),
  })
}

module.exports = {
  methodology: 'TVL sums the on-chain stock-token collateral balances of OCP markets and their settlement vaults on Robinhood Chain, including funds awaiting claim. The stock tokens are counted once at the contracts that hold them.',
  robinhood: { tvl },
}
