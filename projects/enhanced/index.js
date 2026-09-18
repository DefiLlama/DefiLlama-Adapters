const { getLogs } = require('../helper/cache/getLogs')

const ENHANCED_VAULT = '0xB7DA7B8FfCa7cA4bFf6b68024D4BA50Ef337d049'
const DEPLOYMENT_BLOCK = 25645217

const VAULT_CREATED_EVENT =
  'event VaultCreated(bytes32 indexed vaultHash, uint256 cycleDuration, address underlyingAsset, address collateralAsset, address strikeAsset, bool isPut, uint256 capacity, uint256 minInvestmentAmount, uint256 startTime, int256 strikePriceBps, uint256 minPrincipalRatio, int256 buybackPriceRatio, uint256 protocolFeeRate)'
const DEPOSITED_EVENT =
  'event Deposited(bytes32 indexed vaultHash, address indexed user, uint256 recordId, uint256 amount)'

const VAULT_STATE_ABI =
  'function vaults(bytes32) view returns ((uint256 cycleDuration, address underlyingAsset, address collateralAsset, address strikeAsset, bool isPut, uint256 capacity, uint256 minInvestmentAmount, uint256 startTime, int256 strikePriceBps, uint256 minPrincipalRatio, int256 buybackPriceRatio) params, bool isActive, uint256 currentCycleId, uint256 currentCycleStart, uint256 totalDeposited, bool isPaused, bool isEnd, uint256 protocolFeeRate)'
const USER_POSITION_ABI =
  'function getMyPosition(bytes32 vaultHash, address user) view returns ((uint256 activeBalance, uint256 pendingDeposit, uint256 pendingWithdrawAmount, uint256 claimableWithdraw, uint256 claimableSystemPaused, uint256 claimablePremium, uint256 projectedPremium) pos)'

async function tvl(api) {
  const [vaultLogs, depositLogs] = await Promise.all([
    getLogs({
      api,
      target: ENHANCED_VAULT,
      eventAbi: VAULT_CREATED_EVENT,
      fromBlock: DEPLOYMENT_BLOCK,
      onlyArgs: true,
      extraKey: 'vault-created',
    }),
    getLogs({
      api,
      target: ENHANCED_VAULT,
      eventAbi: DEPOSITED_EVENT,
      fromBlock: DEPLOYMENT_BLOCK,
      onlyArgs: true,
      extraKey: 'deposited',
    }),
  ])

  const vaults = [...new Map(vaultLogs.map(log => [log.vaultHash.toLowerCase(), log])).values()]
  const vaultStates = await api.multiCall({
    target: ENHANCED_VAULT,
    abi: VAULT_STATE_ABI,
    calls: vaults.map(({ vaultHash }) => ({ params: [vaultHash] })),
  })

  // Calculate vault principal
  vaults.forEach((vault, index) => {
    const state = vaultStates[index]
    api.add(vault.collateralAsset, state.totalDeposited ?? state[4])
  })

  const vaultByHash = new Map(vaults.map(vault => [vault.vaultHash.toLowerCase(), vault]))

  // Get claimable premiums
  const depositors = [
    ...new Map(
      depositLogs.map(log => [
        `${log.vaultHash.toLowerCase()}:${log.user.toLowerCase()}`,
        { vaultHash: log.vaultHash, user: log.user },
      ]),
    ).values(),
  ]
  const positions = await api.multiCall({
    target: ENHANCED_VAULT,
    abi: USER_POSITION_ABI,
    calls: depositors.map(({ vaultHash, user }) => ({ params: [vaultHash, user] })),
  })

  depositors.forEach(({ vaultHash }, index) => {
    const vault = vaultByHash.get(vaultHash.toLowerCase())
    const position = positions[index].pos ?? positions[index]
    api.add(vault.strikeAsset, position.claimablePremium ?? position[5])
  })
}

module.exports = {
  start: DEPLOYMENT_BLOCK,
  methodology:
    'TVL is calculated by taking the `totalDeposited` for each vault, which includes pending deposits, active deposited asset, pending withdrawal requests and processed-but-unclaimed withdrawals.\n\n' +
    'Only materialized, unclaimed premium is counted. Projected or otherwise unmaterialized premium is excluded. Completed premium claims are also excluded.',
  ethereum: {
    tvl,
  },
}
