const { getLogs2 } = require('../helper/cache/getLogs')

// https://genius.fun/contracts/manifest.json
// Both production factories remain supported after the 4.2 upgrade.
const factories = [
  { target: '0x78EAE9537C0ef90DFe9B7ae964682Fe8138afe31', fromBlock: 122266383 }, // 4.1
  { target: '0x37eE8AeE29C5efd3C1A7edA6dF3F510779928a37', fromBlock: 122874828 }, // 4.2
]
// The shared Genius ecosystem token is excluded even when it is a launch's quote collateral.
const genius = '0x1f12b85aac097e43aa1555b2881e98a51090e9a6'

const events = {
  launched: 'event TokenLaunched(address indexed token, address indexed curve, address indexed deployer, address pairToken, uint256 launchConfigId, uint256 graduationThreshold)',
  swept: 'event LaunchSwept(address indexed token, uint256 quoteOut, uint256 tokenOut)',
  graduated: 'event PoolGraduated(address indexed token, uint256 positionId, uint256 tokenAmount, uint256 pairTokenAmount)',
  rescued: 'event LaunchGraduationRescued(address indexed token, address indexed recipient, uint256 quoteAmount, uint256 tokenAmount)',
}

async function tvl(api) {
  const block = await api.getBlock()
  for (const { target, fromBlock } of factories.filter(f => block >= f.fromBlock)) {
    const logs = {}
    for (const [key, eventAbi] of Object.entries(events))
      logs[key] = await getLogs2({ api, target, fromBlock, eventAbi, extraKey: key, maxBlockRange: 9000 })

    const launches = logs.launched.filter(i => i.pairToken.toLowerCase() !== genius)
    const sweptQuote = {}
    logs.swept.forEach(i => sweptQuote[i.token.toLowerCase()] = i.quoteOut)
    const closed = new Set([...logs.graduated, ...logs.rescued].map(i => i.token.toLowerCase()))

    // Active curves hold their real quote reserve (virtual reserve and accrued fees excluded)
    const active = launches.filter(i => !sweptQuote[i.token.toLowerCase()] && !closed.has(i.token.toLowerCase()))
    const reserves = await api.multiCall({ abi: 'uint256:realQuoteReserve', calls: active.map(i => i.curve) })
    active.forEach((i, idx) => api.add(i.pairToken, reserves[idx]))

    // The crossing buy sweeps the reserve into the factory; it stays there until the graduation
    // transaction seeds PancakeSwap Infinity or the owner rescues the launch
    launches.forEach(i => {
      const token = i.token.toLowerCase()
      if (sweptQuote[token] && !closed.has(token)) api.add(i.pairToken, sweptQuote[token])
    })
  }
}

module.exports = {
  start: '2026-09-16',
  methodology: 'Counts real quote reserves (BNB and approved ERC20 assets) backing active Genius.fun bonding curves, plus reserves swept into the factories while awaiting graduation. Launch state is taken from the factories\' launch, sweep, graduation and rescue events. The GENIUS ecosystem token, virtual reserves, launched-token inventory, accrued fees, fee vaults and treasuries are excluded. Graduated liquidity belongs to PancakeSwap Infinity and is excluded here, as are rescued launches.',
  bsc: { tvl },
}
