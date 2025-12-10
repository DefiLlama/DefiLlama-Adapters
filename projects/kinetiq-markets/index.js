const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs } = require('../helper/cache/getLogs')

const WHYPE = ADDRESSES.hyperliquid.WHYPE
const ROUTER = '0x6AB31532382Ba5cD5E8b5D343Cf5995906bb8DD8'
const KHYPE_MANAGER = '0x393D0B87Ed38fc779FD9611144aE649BA6082109'

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

const eventAbi = "event ExManagerRegistered(address indexed exManager, address indexed exLST)"

const DEFAULT_MANAGERS = [
  '0x4ef8bbacee867efd6faa684b30ecd12df74c4a48'
]

async function getExchangeManagers(api) {
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
    // Fall back to known managers
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

    const supply = await api.call({ target: exLST, abi: 'erc20:totalSupply' })
    if (!supply || supply === '0') continue

    const allowedAssets = await api.call({
      target: ROUTER,
      params: [phase],
      abi: abis.allowedTokensInOnDeposit,
      permitFailure: true
    })

    if (!allowedAssets?.length) continue

    const assetOutputs = await api.multiCall({
      abi: abis.exLstToTokenOut,
      permitFailure: true,
      calls: allowedAssets.map((asset) => ({
        target: ROUTER,
        params: [manager, asset, supply]
      })),
    })

    for (let i = 0; i < allowedAssets.length; i++) {
      const asset = allowedAssets[i]
      const amount = assetOutputs[i]

      if (!amount || amount === '0') continue

      if (asset.toLowerCase() === WHYPE.toLowerCase() ||
          asset.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
        api.add(WHYPE, amount)
        break
      }
    }

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

        withdrawalRequests.forEach((req) => {
          if (!req) return
          const { hypeAmount, timestamp } = req
          if (now >= Number(timestamp) + Number(withdrawalDelay)) {
            api.add(WHYPE, -BigInt(hypeAmount))
          }
        })
      }
    } catch (e) {
      // Continue without withdrawal adjustment
    }
  }
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  methodology: 'TVL is calculated from the total exLST supply converted to underlying HYPE value via router functions.',
  hyperliquid: { tvl }
}
