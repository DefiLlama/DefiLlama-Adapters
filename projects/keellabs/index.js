const { sumTokens2 } = require('../helper/unwrapLPs')

// KeelLabs deploys one non-custodial vault per user per pool (EIP-1167 clones of a shared
// implementation) from a VaultFactory, and each vault keeps a single Uniswap V3 concentrated
// liquidity position that a restricted keeper re-centers. A user may own several vaults, and each
// chain may have more than one factory (a new implementation always ships with a new factory,
// because VaultFactory.implementation is immutable — older factories stay live and are kept here).
const config = {
  arbitrum: {
    factories: [
      '0xBfdDA6efE302fC8743Deb9cD7DB4A24Ffcb9E836',
      '0x3031B1661Bb584bBA566D74Ba0c86Ab6f525AF07',   // VaultNext
    ],
    npm: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  },
  robinhood: {
    factories: [
      '0x7CfCEd5dFeF1884b057553B2b60F5d387005Cd3d',
      '0xAc17cF95525796F81587c47Bb78d4ce7a187e5C7',   // VaultNext (costBasis1 sincronizado) — desplegada 2026-08-03
    ],
    npm: '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3',
  },
  hyperliquid: {
    factories: [
      '0x9d1B8796FB080e07aa26F26765f12e2012DD0d26',
      '0x52dc92C7e3FdbD4fff7892dFc9DC7bc1d7a01ecf',
      '0xF4263810321f03C01abA727De0210c4BFB13fdB8',   // VaultNext
    ],
    // PRJX's position manager, not the chain's default Uniswap deployment.
    npm: '0xeaD19AE861c29bBb2101E834922B2FEee69B9091',
  },
}

async function tvl(api) {
  const { factories, npm } = config[api.chain]

  const lists = await Promise.all(factories.map((target) =>
    api.fetchList({ target, lengthAbi: 'vaultsCount', itemAbi: 'allVaults' })
  ))
  const vaults = lists.flat()
  if (!vaults.length) return

  const [token0s, token1s] = await Promise.all([
    api.multiCall({ calls: vaults, abi: 'address:token0' }),
    api.multiCall({ calls: vaults, abi: 'address:token1' }),
  ])

  // Idle balances sitting in each vault (includes the segregated DCA reserve and the keeper's gas
  // bag — both are user funds held by the vault and withdrawable by its owner).
  const ownerTokens = vaults.map((v, i) => [[token0s[i], token1s[i]], v])

  // ...plus the token0/token1 backing each vault's open Uniswap V3 position.
  return sumTokens2({
    api,
    ownerTokens,
    owners: vaults,
    resolveUniV3: true,
    uniV3ExtraConfig: { nftAddress: npm },
  })
}

module.exports = {
  methodology:
    "Enumerates every vault created by KeelLabs' VaultFactory on each chain, then sums the vault's idle token0/token1 balances (including the DCA reserve and the keeper gas budget, both owner-withdrawable) plus the underlying token0/token1 amounts of its open Uniswap V3 concentrated-liquidity position. All values are read on-chain; no external APIs.",
  arbitrum: { tvl },
  robinhood: { tvl },
  hyperliquid: { tvl },
}
