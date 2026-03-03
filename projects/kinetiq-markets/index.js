const router = '0x6AB31532382Ba5cD5E8b5D343Cf5995906bb8DD8'

const HYPE = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const kHypeManager = '0x393D0B87Ed38fc779FD9611144aE649BA6082109'

const abis = {
  phase: "function phase(address exManager) view returns (uint8)",
  exLST: "function exLST(address exManager) view returns (address)",
  allowedTokensInOnDeposit: "function allowedTokensInOnDeposit(uint8 exPhase) view returns (address[] tokensIn)",
  exLstToTokenOut: "function exLstToTokenOut(address exManager, address tokenOut, uint256 sharesIn) view returns (uint256 amountOut)",
  nextWithdrawalId: "function nextWithdrawalId(address) view returns (uint256)",
  withdrawalDelay: "function withdrawalDelay() view returns (uint256)",
  withdrawalRequests: "function withdrawalRequests(address user, uint256 id) view returns (uint256 hypeAmount, uint256 kHYPEAmount, uint256 kHYPEFee, uint256 bufferUsed, uint256 timestamp)",
};

const managers = [
  '0x4ef8bbacee867efd6faa684b30ecd12df74c4a48' // kmHYPE
]

const tvl = async (api) => {
  const [phases, exLSTs] = await Promise.all([
    api.multiCall({ target: router, calls: managers, abi: abis.phase }),
    api.multiCall({ target: router, calls: managers, abi: abis.exLST }),
  ])

  for (const [index, exLST] of exLSTs.entries()) {
    const phase = phases[index]
    const manager = managers[index]

    const supply = await api.call({ target: exLST, abi: 'erc20:totalSupply' })
    const allowedAssets = await api.call({ target: router, params: phase, abi: abis.allowedTokensInOnDeposit, permitFailure: true })

    if (!allowedAssets?.length) continue

    const assetOutputs = await api.multiCall({
      abi: abis.exLstToTokenOut,
      permitFailure: true,
      calls: allowedAssets.map((asset) => ({ target: router, params: [manager, asset, supply] })),
    })

    allowedAssets.forEach((asset, i) => {
      const amount = assetOutputs[i]
      if (!amount) return
      api.add(asset, amount)
    })

    const [nextWithdrawalId, withdrawalDelay] = await Promise.all([
      api.call({ target: kHypeManager, params: [manager], abi: abis.nextWithdrawalId }),
      api.call({ target: kHypeManager, abi: abis.withdrawalDelay })
    ])

    const withdrawalIds = [...Array(Number(nextWithdrawalId)).keys()]

    const withdrawalRequests = await api.multiCall({
      target: kHypeManager,
      abi: abis.withdrawalRequests,
      calls: withdrawalIds.map((id) => ({ params: [manager, id] })),
      permitFailure: true,
    })

    if (!withdrawalRequests.length) continue
    const now = Math.floor(Date.now() / 1000)

    withdrawalRequests.forEach(({ hypeAmount, timestamp }) => {
      now < Number(timestamp) + Number(withdrawalDelay) ? api.add(HYPE, -hypeAmount) : api.add(HYPE, -0)
    })
  }
}

module.exports = {
  hyperliquid: { tvl }
}
