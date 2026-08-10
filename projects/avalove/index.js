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
  return api.sumTokens({ tokensAndOwners: tao.filter(([t]) => !core.has(t.toLowerCase())) })
}


module.exports = {
  methodology: "TVL is the total value of tokens staked as house liquidity across every game pool deployed through the AvaLove factories on each chain. For each per-game factory the adapter enumerates all deployed pool contracts via getGames() and sums the balance of each pool's staking token held by its game contract. Player bets and payouts flow through these same pools, so their token balances represent the protocol's live liquidity.",
  avax: { tvl, staking },
  robinhood: { tvl, staking },
};
