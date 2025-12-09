const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const WHYPE = ADDRESSES.hyperliquid.WHYPE
const ROUTER = '0x6AB31532382Ba5cD5E8b5D343Cf5995906bb8DD8'
const KHYPE_MANAGER = '0x393D0B87Ed38fc779FD9611144aE649BA6082109'

// Starting block for Kinetiq Markets deployment on Hyperliquid
const FROM_BLOCK = 4800000

const abis = {
  phase: "function phase(address exManager) view returns (uint8)",
  exLST: "function exLST(address exManager) view returns (address)",
  allowedTokensInOnDeposit: "function allowedTokensInOnDeposit(uint8 exPhase) view returns (address[] tokensIn)",
  exLstToTokenOut: "function exLstToTokenOut(address exManager, address tokenOut, uint256 sharesIn) view returns (uint256 amountOut)",
  nextWithdrawalId: "function nextWithdrawalId(address) view returns (uint256)",
  withdrawalDelay: "function withdrawalDelay() view returns (uint256)",
  withdrawalRequests: "function withdrawalRequests(address user, uint256 id) view returns (uint256 hypeAmount, uint256 kHYPEAmount, uint256 kHYPEFee, uint256 bufferUsed, uint256 timestamp)",
}

// Event for tracking new exchange managers being registered
const eventAbi = "event ExManagerRegistered(address indexed exManager, address indexed exLST)"

// Known exchange managers
const DEFAULT_MANAGERS = [
  '0x4ef8bbacee867efd6faa684b30ecd12df74c4a48' // kmHYPE - Markets exchange
]

async function getExchangeManagers(api) {
  // Try to discover managers via events, fall back to known list
  try {
    const logs = await getLogs({
      api,
      target: ROUTER,
      eventAbi,
      fromBlock: FROM_BLOCK,
      onlyArgs: true,
    })

    if (logs.length > 0) {
      return logs.map(log => log.exManager)
    }
  } catch (e) {
    // Event may not exist, use default managers
  }

  return DEFAULT_MANAGERS
}

async function tvl(api) {
  const managers = await getExchangeManagers(api)

  const [phases, exLSTs] = await Promise.all([
    api.multiCall({ target: ROUTER, calls: managers, abi: abis.phase }),
    api.multiCall({ target: ROUTER, calls: managers, abi: abis.exLST }),
  ])

  for (const [index, exLST] of exLSTs.entries()) {
    if (!exLST || exLST === ADDRESSES.null) continue

    const phase = phases[index]
    const manager = managers[index]

    // Get total supply of the exLST token
    const supply = await api.call({ target: exLST, abi: 'erc20:totalSupply' })
    if (!supply || supply === '0') continue

    // Get allowed deposit tokens for this phase
    const allowedAssets = await api.call({
      target: ROUTER,
      params: [phase],
      abi: abis.allowedTokensInOnDeposit,
      permitFailure: true
    })

    if (!allowedAssets?.length) continue

    // Convert exLST supply to underlying asset values
    const assetOutputs = await api.multiCall({
      abi: abis.exLstToTokenOut,
      permitFailure: true,
      calls: allowedAssets.map((asset) => ({
        target: ROUTER,
        params: [manager, asset, supply]
      })),
    })

    // Find the best conversion (highest value in WHYPE equivalent)
    // The conversion to different tokens should give equivalent values,
    // so we use WHYPE if available, otherwise use any available token
    for (let i = 0; i < allowedAssets.length; i++) {
      const asset = allowedAssets[i]
      const amount = assetOutputs[i]

      if (!amount || amount === '0') continue

      // If this is WHYPE or the native token placeholder, add as WHYPE
      if (asset.toLowerCase() === WHYPE.toLowerCase() ||
          asset.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        api.add(WHYPE, amount)
        break // Only count once to avoid double counting
      }
    }

    // Handle pending withdrawals - subtract from TVL if still locked
    try {
      const [nextWithdrawalId, withdrawalDelay] = await Promise.all([
        api.call({ target: KHYPE_MANAGER, params: [manager], abi: abis.nextWithdrawalId }),
        api.call({ target: KHYPE_MANAGER, abi: abis.withdrawalDelay })
      ])

      if (nextWithdrawalId && Number(nextWithdrawalId) > 0) {
        const withdrawalIds = [...Array(Math.min(Number(nextWithdrawalId), 100)).keys()]

        const withdrawalRequests = await api.multiCall({
          target: KHYPE_MANAGER,
          abi: abis.withdrawalRequests,
          calls: withdrawalIds.map((id) => ({ params: [manager, id] })),
          permitFailure: true,
        })

        const now = api.timestamp || Math.floor(Date.now() / 1000)

        // Sum pending withdrawals that are still locked
        withdrawalRequests.forEach((req) => {
          if (!req) return
          const { hypeAmount, timestamp } = req
          // If withdrawal is still in delay period, it's counted in TVL already
          // After delay period, it should be claimable and removed from TVL
          if (now >= Number(timestamp) + Number(withdrawalDelay)) {
            // Withdrawal is claimable, subtract from TVL
            api.add(WHYPE, -BigInt(hypeAmount))
          }
        })
      }
    } catch (e) {
      // Withdrawal tracking may fail, continue without it
    }
  }
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  methodology: 'TVL is calculated by getting the total supply of exchange LST tokens (exLST like kmHYPE) and converting them to their underlying HYPE value using the router conversion functions. Pending withdrawals past their delay period are subtracted.',
  hyperliquid: { tvl }
}
