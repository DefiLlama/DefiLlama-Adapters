const { sumTokens2 } = require('../helper/unwrapLPs')

// KeelLabs deploys a non-custodial vault per position (EIP-1167 clones of a shared implementation)
// from a VaultFactory, and each vault keeps a single Uniswap V3 concentrated liquidity position
// that a restricted keeper re-centers. A user may own several vaults — since the 2026-08-15
// factories, several in the same pool — and each chain may have more than one factory. Older
// factories stay live and are kept here.
const config = {
  arbitrum: {
    factories: [
      '0xBfdDA6efE302fC8743Deb9cD7DB4A24Ffcb9E836',
      '0x3031B1661Bb584bBA566D74Ba0c86Ab6f525AF07',   // VaultNext
      '0xAd7f3B6C7D16e19A3284BE0cE14578296feA471A',   // VaultRecover
      '0xF41AA2bb58952F490E2DFe437d50489Ac3c6A4bC',   // VaultClaim
      '0x3e682FEC310d297cB109AC0b1Fe53F4EB0C8a5F8',   // Keellabs v2 — deployed 2026-08-05
      '0x61C6dEc573505125EBc2b7e569250262b8dF33bC',   // fresh factory — deployed 2026-08-09
      '0xDa877e3A5896dba00309684A5B40441f6A37e6e5',   // multi-vault factory — deployed 2026-08-15
    ],
    npm: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
  },
  robinhood: {
    factories: [
      '0x7CfCEd5dFeF1884b057553B2b60F5d387005Cd3d',
      '0xAc17cF95525796F81587c47Bb78d4ce7a187e5C7',   // VaultNext (costBasis1 sincronizado) — desplegada 2026-08-03
      '0x62fC42AA2Aa1F8743d97daBeD925E70E04682a1c',   // VaultRecover
      '0x3031B1661Bb584bBA566D74Ba0c86Ab6f525AF07',   // VaultClaim
      '0x7c32443061e54681ebc9f8581E4fc2867A2D6384',   // Keellabs v2 — deployed 2026-08-05
      '0x2fA41b881d194628160d7f95f10442Dc6BC5e06F',   // fresh factory — deployed 2026-08-09
      '0xc92bf423d730f1CA42F852d5Fc85467A10bCa572',   // multi-vault factory — deployed 2026-08-15
    ],
    npm: '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3',
  },
  hyperliquid: {
    factories: [
      '0x9d1B8796FB080e07aa26F26765f12e2012DD0d26',
      '0x811e2843c2a55b70D9C867988D69E624c35dAF4C',   // VaultRecover
      '0x609B9A1c089cb29a38bf19901a39259493997AB4',   // VaultClaim
      '0x1E2c70bbEB3A156443B6ECBa23105FedD74a71a8',   // Keellabs v2 — deployed 2026-08-05
      '0xb2AA23f1664dB2AC87816ad69a2C19f217F57fc4',   // fresh factory — deployed 2026-08-09
      '0x309b918A4EBf5aB960B7787FE154d10229ED928b',   // multi-vault factory — deployed 2026-08-15
    ],
    // PRJX's position manager, not the chain's default Uniswap deployment.
    npm: '0xeaD19AE861c29bBb2101E834922B2FEee69B9091',
  },
  bsc: {
    // BNB Chain, launched 2026-08-18 on PancakeSwap V3. The factory address had been mistakenly
    // listed under `hyperliquid` (where it reads nothing), so BNB TVL was going uncounted.
    factories: [
      '0x52dc92C7e3FdbD4fff7892dFc9DC7bc1d7a01ecf',   // multi-vault factory — deployed 2026-08-18
    ],
    // PancakeSwap V3's position manager, not the chain's default Uniswap deployment.
    npm: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
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
  bsc: { tvl },
}
