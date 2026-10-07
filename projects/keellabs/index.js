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
      '0xcebfd0ed307e095b320d73fa83b770c693e164c9',   // gas-optimized factory — deployed 2026-09-04
      '0x3bfe98518FBE39F368395EdB82a1D6e8A581Fe39',   // current factory — deployed 2026-09-30
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
      '0xd4be8c553b7b26b3bae22b93498e035a4a923092',   // gas-optimized factory — deployed 2026-09-04
      '0x041CA7A5F1113279edEC154B9B31Ee9380d55A70',   // current factory — deployed 2026-09-30
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
      '0xf02a1944b264dad67ed096c00d27c2b6d846faa9',   // gas-optimized factory — deployed 2026-09-04
      '0xbE14445dcDab8d00d8497b3BA09CB2bA156353Fc',   // current factory — deployed 2026-09-30
    ],
    // PRJX's position manager, not the chain's default Uniswap deployment.
    npm: '0xeaD19AE861c29bBb2101E834922B2FEee69B9091',
  },
  bsc: {
    // BNB Chain, launched 2026-08-18 on PancakeSwap V3. The factory address had been mistakenly
    // listed under `hyperliquid` (where it reads nothing), so BNB TVL was going uncounted.
    factories: [
      '0x52dc92C7e3FdbD4fff7892dFc9DC7bc1d7a01ecf',   // multi-vault factory — deployed 2026-08-18
      '0x0982a86fc8e14653f263f1fe08d0f32227e383ff',   // gas-optimized factory — deployed 2026-09-04
      '0x1326b172e8419b6057e85fAA3605826b2DddAB60',   // current factory — deployed 2026-09-30
    ],
    // PancakeSwap V3's position manager, not the chain's default Uniswap deployment.
    npm: '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364',
  },
  base: {
    // Base, launched 2026-09-05 on AERODROME SLIPSTREAM (Aerodrome's concentrated-liquidity DEX),
    // where the tokenized-stock (Coinbase B20) liquidity lives. Slipstream is a Uniswap-V3 fork
    // indexed by tickSpacing instead of fee; its NonfungiblePositionManager exposes the same
    // positions()/pool ABI shape, so the V3 NFT unwrap resolves it the same way.
    factories: [
      '0xa215f5c5b1A0Fc322376593F75fA422fcEB6712d',   // Slipstream factory — deployed 2026-09-05
    ],
    // Aerodrome Slipstream's NonfungiblePositionManager (the NEW deployment, where the stock pools
    // are), not the default Uniswap one.
    npm: '0xe1f8cd9AC4e4A65F54f38a5CdAfCA44f6dD68b53',
  },
  ethereum: {
    // Ethereum mainnet, launched 2026-09-30 on Uniswap V3.
    factories: [
      '0xcc5E6AE42dD0D3DB2aD9016994cFEf460d05E781',   // factory — deployed 2026-09-30
    ],
    npm: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
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

  // ...plus the token0/token1 backing each vault's open concentrated-liquidity position.
  //
  // Base runs on Aerodrome SLIPSTREAM, a Uniswap-V3 fork indexed by tickSpacing (not fee). Its NFT
  // positions must be resolved with DefiLlama's Slipstream-v3 resolver, NOT the generic Uniswap-v3
  // one (which derives the pool by fee and would miss the position). DefiLlama already ships our NPM
  // (0xe1f8cd9A…) as the default Slipstream-v3 NFT on base, so no extra config is needed — and
  // passing `uniV3ExtraConfig` here would wrongly trigger the Uniswap-v3 path too. The other chains
  // are Uniswap/PancakeSwap V3, whose NPM is non-default and must be passed explicitly.
  const slip = api.chain === 'base'
  return sumTokens2({
    api,
    ownerTokens,
    owners: vaults,
    ...(slip
      ? { resolveSlipstreamV3: true }
      : { resolveUniV3: true, uniV3ExtraConfig: { nftAddress: npm } }),
  })
}

module.exports = {
  methodology:
    "Enumerates every vault created by KeelLabs' VaultFactory on each chain, then sums the vault's idle token0/token1 balances (including the DCA reserve and the keeper gas budget, both owner-withdrawable) plus the underlying token0/token1 amounts of its open concentrated-liquidity position — Uniswap V3 on Arbitrum/Robinhood/Ethereum, PancakeSwap V3 on BNB, PRJX on HyperEVM, and Aerodrome Slipstream on Base. All values are read on-chain; no external APIs.",
  arbitrum: { tvl },
  robinhood: { tvl },
  hyperliquid: { tvl },
  bsc: { tvl },
  base: { tvl },
  ethereum: { tvl },
}
