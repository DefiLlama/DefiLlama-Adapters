const { sumTokens2, unwrapSlipstreamNFT } = require('../helper/unwrapLPs')

const FACTORY = '0x27658bD271449cD7467Cdb0FD6E6C32F789E9eFB'
const FROM_BLOCK = 64574208 // first VaultDeployed
const VAULT_DEPLOYED = 'event VaultDeployed(address indexed vault, address indexed vaultOwner, uint256 indexed generation)'

// up. concentrated-liquidity position manager (Slipstream-style)
const UP_NFPM = '0x07F44c47743A2f36414A82b9F558ECFCf0EEdCEf'

// Idle balances held directly by vaults between rotations
const TOKENS = [
  '0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168', // USDG
  '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73', // WETH
  '0x57C0E45cB534413D1C20A4240955d6bB250BB4F1', // UP
  '0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9', // AAPL
  '0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC', // NVDA
  '0x322F0929c4625eD5bAd873c95208D54E1c003b2d', // TSLA
  '0x117cc2133c37B721F49dE2A7a74833232B3B4C0C', // SPY
  '0x12f190a9F9d7D37a250758b26824B97CE941bF54', // AMZN
  '0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35', // META
]

async function getVaults(api) {
  const logs = await api.getLogs({
    target: FACTORY,
    eventAbi: VAULT_DEPLOYED,
    fromBlock: FROM_BLOCK,
    onlyArgs: true,
  })
  return logs.map(l => l.vault)
}

async function tvl(api) {
  const vaults = await getVaults(api)

  // 1. up. CL positions held as NFTs by each vault
  for (const owner of vaults) {
    await unwrapSlipstreamNFT({ api, owner, nftAddress: UP_NFPM })
  }

  // 2. Idle token balances sitting in the vaults
  await sumTokens2({ api, owners: vaults, tokens: TOKENS })

  // 3. TODO — Uniswap v4 positions.
  //    getPositions() on each vault returns a mixed bytes32[]:
  //      values < 2**32  -> up. position NFT ids (covered above)
  //      full 32-byte    -> v4 pool identifiers
  //    Resolving these needs the PoolKey + tickLower/tickUpper/liquidity
  //    per position, which the vault does not currently expose.
  //    Once available, use addV4Positions() from projects/stonkbrokers/helpers.js
  //    against StateView 0xf3334192d15450cdd385c8b70e03f9a6bd9e673b
}

module.exports = {
  methodology:
    'Enumerates every Crossbow vault from the factory VaultDeployed event, then sums each vault\'s up. concentrated-liquidity NFT positions and its idle token balances. Doublecounted against the underlying DEX TVL.',
  doublecounted: true,
  robinhood: { tvl },
}
