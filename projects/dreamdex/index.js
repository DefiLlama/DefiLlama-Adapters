const ADDRESSES = require('../helper/coreAssets.json')

// dreamDEX — spot central limit order book (CLOB) on Somnia mainnet.
// TVL is custodied in two contract types per market:
//   - SpotPool: resting-order principal + internal ERC20Vault balances (incl. market-maker deposits,
//     which run in manual-vault mode and deposit their capital into the pool).
//   - SpotStopOrderRegistry: native SOMI that funds stop-order execution (grows with pending orders).

const USDso = '0x00000022dA000002656c64D9eA6011ea952D008A' 

// Official markets (each SpotPool verified isRegistered=true on-chain). Quote is USDso for every
// market. { base, pool, stopReg }. Update when new markets are launched/registered.
const MARKETS = [
  { base: ADDRESSES.null, pool: '0x035De7403eac6872787779CCA7CCF1b4CDb61379', stopReg: '0x68c8f6fb1EA19A28F25358Ff00b8Ed8E1216df30' }, // SOMI/USDso (native base; getPoolParams returns a codeless sentinel for native)
  { base: ADDRESSES.somnia.USDC, pool: '0x47fD2f18426f67106DBaC82F6d21D446c5F2120b', stopReg: '0xD53E3F3b73513F2147377ef8f573f649cF60100c' }, // USDC.e/USDso
  { base: '0xC5098b3cA516784323872F17235fa074E167D3D2', pool: '0x25bfF6B7B5E2243424F38E75de7ab03C0522a5EA', stopReg: '0xed32F048D6a47923D38eCeD868d6f8b0eB4852bd' }, // WBTC/USDso
  { base: ADDRESSES.somnia.WETH, pool: '0xa936da11B57b50A344e1293AAaE5232885ea2bDE', stopReg: '0x9653a7355849B7691802A6AA49fDe18eF5ba633d' }, // WETH/USDso
]

module.exports = {
  methodology:
    'dreamDEX is a central limit order book (CLOB) spot exchange on Somnia. TVL is the base and quote ' +
    'token balances held on-chain by each market\'s SpotPool (resting-order principal plus internal ' +
    'ERC20Vault balances, including market-maker deposits) and its SpotStopOrderRegistry (native SOMI ' +
    'that funds stop-order execution). Base assets SOMI (native), USDC.e, WBTC and WETH are priced by ' +
    'DefiLlama. The quote asset USDso is a USD-pegged stablecoin backed 1:1 by FraxUSD (bridged via ' +
    'LayerZero).',
  somnia: {
    tvl: async (api) => {
      const owners = MARKETS.flatMap((m) => [m.pool, m.stopReg])

      const tokensAndOwners = []
      // Base ERC20 legs (USDC.e/WBTC/WETH) held by the pool and its stop-order registry.
      for (const m of MARKETS) {
        if (m.base !== ADDRESSES.null) tokensAndOwners.push([m.base, m.pool], [m.base, m.stopReg])
      }
      // base liquidity in the SOMI pool + stop-order gas funding + USDso quote in every registry.
      const ownerTokens = []
      for (const owner of owners) ownerTokens.push([[USDso, ADDRESSES.null], owner])
      
      await api.sumTokens({ tokensAndOwners, ownerTokens })
    },
  },
}
