const { getLogs } = require("../helper/cache/getLogs")

const CHAIN = "kasplex"
const factory = '0x09df701f1f5df83a3bbef7da4e74bb075199d6a4'

// Map of token addresses to CoinGecko IDs
const ADDRESS_TO_CG = {
  "0xb7a95035618354d9adfc49eca49f38586b624040": "zeal",
  "0x9a5a144290dffa24c6c7aa8ca9a62319e60973d8": "nacho-the-kat",
  "0x1f3ce97f8118035dba7fbcd5398005491cf45603": "kasper",
  "0x98508da68180e3c23bee5685f14ad2da5195da12": "keiro",
  "0x0fd8d408ce707f4e4f8e54193c4c55a3b969834b": "krex",
  "0xc47c03309c1c5e17b4a0b542dec2e47c99f16a5d": "mambo",
}

const erc20Abi = {
  balanceOf: "function balanceOf(address) view returns (uint256)",
  decimals: "function decimals() view returns (uint8)",
}

module.exports = {
  [CHAIN]: {
    tvl: async (api) => {
      // Get pool creation events
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118'],
        fromBlock: 484634,
        eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address pool)',
        onlyArgs: true,
      })

      const pools = logs.map(i => i.pool)
      const token0s = logs.map(i => i.token0)
      const token1s = logs.map(i => i.token1)
      
      // Get all unique tokens
      const allTokens = [...new Set([...token0s, ...token1s])]
      
      // Get balances for all tokens in all pools
      const balanceCalls = []
      pools.forEach((owner, i) => {
        balanceCalls.push({ target: token0s[i], params: owner })
        balanceCalls.push({ target: token1s[i], params: owner })
      })
      
      const decimalCalls = allTokens.map(token => ({ target: token }))
      
      const [bals, decimalsArr] = await Promise.all([
        api.multiCall({ abi: erc20Abi.balanceOf, calls: balanceCalls, permitFailure: true }),
        api.multiCall({ abi: erc20Abi.decimals, calls: decimalCalls, permitFailure: true }),
      ])
      
      // Create decimals map
      const decimalsMap = {}
      allTokens.forEach((token, i) => {
        if (decimalsArr[i] != null) {
          decimalsMap[token.toLowerCase()] = Number(decimalsArr[i])
        }
      })
      
      // Aggregate balances by token
      const tokenBalances = {}
      
      for (let i = 0; i < bals.length; i += 2) {
        const poolIndex = Math.floor(i / 2)
        const token0 = token0s[poolIndex]
        const token1 = token1s[poolIndex]
        const bal0 = bals[i]
        const bal1 = bals[i + 1]
        
        if (bal0 != null && bal0 > 0) {
          const key = token0.toLowerCase()
          tokenBalances[key] = (tokenBalances[key] || 0n) + BigInt(bal0)
        }
        
        if (bal1 != null && bal1 > 0) {
          const key = token1.toLowerCase()
          tokenBalances[key] = (tokenBalances[key] || 0n) + BigInt(bal1)
        }
      }
      
      // Convert to human-readable balances with CoinGecko IDs
      const balances = {}
      
      for (const [tokenAddr, balance] of Object.entries(tokenBalances)) {
        if (balance === 0n) continue
        
        const decimals = decimalsMap[tokenAddr] || 18
        const divisor = 10 ** decimals
        const human = Number(balance) / divisor
        
        const key = ADDRESS_TO_CG[tokenAddr] || `${CHAIN}:${tokenAddr}`
        balances[key] = (balances[key] || 0) + human
      }
      
      return balances
    }
  }
}