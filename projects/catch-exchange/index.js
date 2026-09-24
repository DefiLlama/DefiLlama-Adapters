const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const FACTORY = '0x21acbcc6227cf5d2fb5eb876735edd04f7b49c12'
const CATCH = '0xe9e5cfdca8fbee1f68a7c92d7316331d1aab5fb9'
const FROM_BLOCK = 54377703

const familyLaunchedEvent = 'event FamilyLaunched(bytes32 indexed familyId, uint256 indexed familyIndex, address indexed underlying, address cAsset, address releaseVault, address reserveVault, address hook, address liquidityLocker, address feeLedger, address releaseController, bytes32 poolId, bytes32 configHash, bytes32 dependencyHash)'

async function tvl(api) {
  const families = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: FROM_BLOCK,
    eventAbi: familyLaunchedEvent,
  })

  const ownerTokens = families
    .filter(({ underlying }) => underlying.toLowerCase() !== CATCH)
    .map(({ underlying, reserveVault }) => [[underlying], reserveVault])

  return sumTokens2({ api, ownerTokens })
}

module.exports = {
  methodology: 'TVL is the value of external underlying assets held in Catch family reserve vaults and redeemable by active cAsset holders. Uniswap V4 liquidity, unreleased cAsset inventory, fee-routing balances, and the CATCH-backed cCATCH family are excluded.',
  start: 1788536290, // First Catch family launch (Robinhood block 54377703)
  robinhood: { tvl },
}
