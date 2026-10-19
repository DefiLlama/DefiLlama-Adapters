const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')
const { liveAt } = require('../stonkbrokers/helpers')

// Smart LP (Volatility Farming): immutable concentrated-liquidity vaults on
// canonical Uniswap V3 pools, enumerated from a chain-local registry.
const config = {
  robinhood: { registry: '0xE8749183Fbf6A657EB58B3a4D3E4B9Cc09560146', nftAddress: '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3', fromBlock: 55893170 },
  arbitrum: { registry: '0xFB2eA53b16C07011d4390A2e449385180A54eD5e', nftAddress: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88', fromBlock: 505000000 },
}

// The protocol's own token is tracked under stonkbrokers staking, not TVL.
const STONKBROKER = '0xe934e36A439C94017B64a3FecE66AF12099aBF50'

async function tvl(api) {
  const { registry, nftAddress, fromBlock } = config[api.chain]
  if (!liveAt(api, fromBlock)) return
  // all() is the live listing; a delisted vault keeps its position NFT, so
  // union it with every VaultListed event. Each vault owns one position NFT
  // (both legs counted) plus idle balances held between compounds.
  const [listed, logs] = await Promise.all([
    api.call({ abi: 'address[]:all', target: registry }),
    getLogs2({ api, target: registry, fromBlock, eventAbi: 'event VaultListed(address indexed vault, address indexed pool, uint8 mode)' }),
  ])
  const vaults = [...new Set([...listed, ...logs.map((l) => l.vault)].map((v) => v.toLowerCase()))]
  if (!vaults.length) return
  await sumTokens2({ api, owners: vaults, resolveUniV3: true, uniV3ExtraConfig: { nftAddress } })
  const [token0s, token1s] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: vaults }),
    api.multiCall({ abi: 'address:token1', calls: vaults }),
  ])
  await sumTokens2({ api, ownerTokens: vaults.map((vault, i) => [[token0s[i], token1s[i]], vault]) })
  if (api.chain === 'robinhood') api.removeTokenBalance(STONKBROKER)
}

module.exports = {
  methodology:
    'TVL is the Smart LP (Volatility Farming) vaults on Robinhood Chain and Arbitrum One: every vault the registry has ever listed, each owning one Uniswap V3 position NFT (both legs counted) plus idle balances held between compounds. STONKBROKER is excluded from TVL and tracked under StonkBrokers staking.',
  doublecounted: true,
  robinhood: { start: '2026-09-06', tvl },
  arbitrum: { start: '2026-09-15', tvl },
}
