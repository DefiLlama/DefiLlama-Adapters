const { getEventLogs } = require('@defillama/sdk')

// https://genius.fun/contracts/manifest.json
// Both production factories remain supported after the 4.2 upgrade.
const factories = [
  { address: '0x78EAE9537C0ef90DFe9B7ae964682Fe8138afe31', fromBlock: 122266383 }, // 4.1
  { address: '0x37eE8AeE29C5efd3C1A7edA6dF3F510779928a37', fromBlock: 122874828 }, // 4.2
]
// The shared Genius ecosystem token is excluded even when it is a launch's quote collateral.
const genius = '0x1f12b85aac097e43aa1555b2881e98a51090e9a6'
const tokenLaunched = 'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)'
const getLaunchedToken = 'function getLaunchedToken(address) view returns ((address token, address curve, address deployer, address creatorFeeRecipient, address pairToken, uint256 graduationThreshold, uint24 poolFee, int24 tickSpacing, uint16 creatorTaxBps, bool buybackEnabled, uint8 phase, uint256 sweptQuote, uint256 sweptTokens, uint256 sweptAt, bool exists))'

async function tvl(api) {
  const block = await api.getBlock()
  for (const { address, fromBlock } of factories.filter(f => block >= f.fromBlock)) {
    const launches = (await getEventLogs({
      chain: api.chain, target: address, fromBlock, toBlock: block, eventAbi: tokenLaunched, onlyArgs: true,
      maxBlockRange: 9000,
    })).filter(l => l.pairToken.toLowerCase() !== genius)
    if (!launches.length) continue

    // Public BSC RPCs limit eth_call request bodies; the SDK's default 300-call batch exceeds them.
    const records = await api.multiCall({
      target: address, abi: getLaunchedToken, calls: launches.map(l => l.token), chunkSize: 50,
    })
    const active = records.filter(l => String(l.phase) === '0') // NotGraduated
    const reserves = await api.multiCall({ abi: 'uint256:realQuoteReserve', calls: active.map(l => l.curve), chunkSize: 50 })
    active.forEach((l, i) => api.add(l.pairToken, reserves[i]))

    // The crossing buy first transfers reserves into the factory. Keep counting them until the
    // separate graduation transaction seeds PancakeSwap Infinity, or the owner rescues them.
    records.filter(l => String(l.phase) === '1').forEach(l => api.add(l.pairToken, l.sweptQuote))
  }
}

module.exports = {
  start: '2026-09-16',
  methodology: 'Counts real quote reserves (BNB and approved ERC20 assets) backing Genius.fun bonding curves, plus reserves swept into the production factories while awaiting graduation. Curve realQuoteReserve and factory sweptQuote are read at the requested block. The GENIUS ecosystem token, virtual reserves, launched-token inventory, accrued fees, fee vaults and treasuries are excluded. Graduated liquidity belongs to PancakeSwap Infinity and is excluded here, as are terminally rescued launches.',
  bsc: { tvl },
}
