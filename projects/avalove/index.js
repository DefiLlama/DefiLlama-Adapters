const ADDRESSES = require('../helper/coreAssets.json')

const GAME_INFO_ABI = "function getGames(uint256 start, uint256 end) view returns ((address gameAddress, address owner, address creator, address token, string tokenLogoUrl, string betName, uint256 createdAt)[])";
const TOTAL_GAMES_ABI = "function getTotalGames() view returns (uint256)";

// Per-game V3 factories. Addresses are public on-chain deployments.
const FACTORIES = {
  avax: [
    "0x001AfbeEdd4524f46f697356E19c83136f67DB9E", // roulette
    "0x607c3E9AA1F1d3BDB1AC4F1E142d2b14Fd9542be", // slots
    "0xF84ee9817099051078018A45aDc2ca9e7410E4c1", // crash
    "0x4a600d2e1ad60d17E25177D6Ff50a2a7053f785c", // plinko
    "0xCaBb7d93f9b283BC519C095a9ad64261FEFBcc12", // mines
    "0x79AFa26dE82c6e7FA2E3D044BeE717071ff8D826", // dice
    "0xd82330003a3d9B687a744bd666663E64CE02073E", // wheel
    "0x188Fb9E83D6B103a6A94875Fc2A60CA9bbc3d4d1", // coinflip
    "0xc1bc22A08fDCd9e78Add8BB361bcC01C3588F6b1", // blackjack
    "0x76D987CFae6b8751c3a5ae16f046E098694ba9C9", // boxes
    "0x96e3136E7a77aE1f5714d599553a4D16116A12db", // pvp
    "0xcAf8336b4B39da78fEfb709C18cdD1b8C0844625", // chess
  ],
  robinhood: [
    "0x44879d592851CD23853FA9802e01738E09b742eB", // roulette
    "0x37B46a6c3ED48bb7024Aa5Ad263C9b09d5c5e14b", // crash
    "0xC7632E38D3eeed5b057D984132F48A258c981DB0", // blackjack
    "0xB9409da5E0B3E290FA3482f439a9791aEA13DA57", // coinflip
    "0x9AB72Fc99C13b02c7453378AEA431D9589A54F4B", // plinko
    "0x1548b370F7b09314A8cDEEf0fA030B2BF1cF22f1", // dice
    "0x67BA9345D8e829034dd2341F3a95bEbBa4692718", // wheel
    "0x17D937E32ae4014dC53AACA1E7d7e1a4Db205D87", // mines
    "0xe9e1967C2943b45c46Ba62538C9fA8C492CFEFB0", // slots
    "0x842A87aed27d7449d8725480EFa0462557239C6E", // boxes
  ],
};

// Protocol-level $AVLO staking (ProtocolYield). Separate system from per-game
// house liquidity: users stake native AVLO to earn a share of treasury fees.
const PROTOCOL_YIELD = {
  avax: "0x5C0A35ABCBAb5b6F45d5e122ecAbe0d2678513E5",
  robinhood: "0x3ae963eD481f95BcF4bd69aD9E6390f84bc68C04",
};

const AVLO = {
  avax: "0x54eEeB249E3AE445f21eb006DEbB33eFa2B4b3Bb",
  robinhood: "0x7e37298e240c1E644F6F9F96b6A3AA6C5aea9885",
};

// AVLO has no direct DefiLlama price. Its only on-chain market is a Uniswap v4
// pool AVLO/ARENA on Avalanche; ARENA *is* priced by DefiLlama. So on Avalanche
// we read the pool's on-chain mid price (v4 StateView.getSlot0 -> sqrtPriceX96)
// and account the AVLO balances as their ARENA-equivalent, which DefiLlama then
// prices. Pure on-chain read — no external price fetch.
const V4_STATEVIEW = "0xc3c9e198c735a4b97e3e683f391ccbdd60b69286"; // Uniswap v4 StateView (Avalanche)
const AVLO_ARENA_POOL_ID = "0x18f3b5331e528e9a37200708c6c5f4de1b33536c0a0c9ad7856ebab7f37a84a9";
const ARENA_AVAX = "0xB8d7710f7d8349A506b75dD184F05777c82dAd0C";
const SLOT0_ABI = "function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)";
// currency0 = AVLO (0x54..) < currency1 = ARENA (0xB8..); both 18 decimals, so
// ARENA-per-AVLO = sqrtPriceX96^2 / 2^192 and no decimal scaling is needed.
const Q192 = 2n ** 192n;

const PAGE = 1000; // pools per getGames call

async function getGameTokensAndOwners(api) {
  const factories = FACTORIES[api.chain] || []
  if (!factories.length) return []
  const totals = await api.multiCall({ abi: TOTAL_GAMES_ABI, calls: factories })
  const calls = factories.flatMap((target, i) => {
    const total = Number(totals[i] || 0)
    return Array.from({ length: Math.ceil(total / PAGE) }, (_, k) => ({
      target, params: [k * PAGE, Math.min((k + 1) * PAGE, total)],
    }))
  })
  const pages = await api.multiCall({ abi: GAME_INFO_ABI, calls })
  return pages.filter(Boolean).flatMap(games => games.filter(g => g.token).map(g => [g.token, g.gameAddress]))
}

// filter by core assets so launchpad tokens can be exported separately as staking
const coreSet = (chain) => new Set([ADDRESSES.null, ...Object.values(ADDRESSES[chain] || {})].map(a => a.toLowerCase()))

async function tvl(api) {
  const tao = await getGameTokensAndOwners(api)
  const core = coreSet(api.chain)
  return api.sumTokens({ tokensAndOwners: tao.filter(([t]) => core.has(t.toLowerCase())) })
}

async function staking(api) {
  const tao = await getGameTokensAndOwners(api)
  const core = coreSet(api.chain)
  const avlo = (AVLO[api.chain] || "").toLowerCase()

  // Non-core game-pool tokens EXCEPT AVLO → priced normally by DefiLlama.
  const others = tao.filter(([t]) => !core.has(t.toLowerCase()) && t.toLowerCase() !== avlo)
  await api.sumTokens({ tokensAndOwners: others })

  // AVLO owners = every AVLO house-liquidity pool + the ProtocolYield contract.
  const avloOwners = tao.filter(([t]) => t.toLowerCase() === avlo).map(([, owner]) => owner)
  if (PROTOCOL_YIELD[api.chain]) avloOwners.push(PROTOCOL_YIELD[api.chain])

  if (avloOwners.length) {
    if (api.chain === 'avax') {
      // Sum AVLO across all owners, convert to ARENA-equivalent via the v4 mid price.
      const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: avloOwners.map(o => ({ target: AVLO.avax, params: [o] })) })
      let total = 0n
      for (const b of bals) total += BigInt(b || 0)
      if (total > 0n) {
        const slot0 = await api.call({ target: V4_STATEVIEW, abi: SLOT0_ABI, params: [AVLO_ARENA_POOL_ID] })
        const sqrt = BigInt(slot0.sqrtPriceX96 ?? slot0[0])
        const arenaEquivalent = (total * sqrt * sqrt) / Q192
        api.add(ARENA_AVAX, arenaEquivalent) // priced as ARENA by DefiLlama
      }
    } else {
      // Other chains have no local ARENA pool; count raw AVLO (priced once AVLO
      // gets a DefiLlama price on that chain, otherwise $0).
      await api.sumTokens({ tokensAndOwners: avloOwners.map(o => [avlo, o]) })
    }
  }

  return api.getBalances()
}

module.exports = {
  methodology: "TVL is the total value of tokens staked as house liquidity across every game pool deployed through the AvaLove factories on each chain, plus protocol-level $AVLO staked in the ProtocolYield contract. Pools are enumerated via each factory's getGames(). AVLO has no direct DefiLlama price, so on Avalanche its balances are accounted as their ARENA-equivalent using the on-chain Uniswap v4 AVLO/ARENA mid price (StateView.getSlot0); ARENA is priced by DefiLlama.",
  avax: { tvl, staking },
  robinhood: { tvl, staking },
};
