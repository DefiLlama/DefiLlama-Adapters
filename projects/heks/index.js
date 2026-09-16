// ЭТОТ ФАЙЛ ЕДЕТ НЕ К НАМ. Его место — `projects/heks/index.js` в репозитории
// DefiLlama/DefiLlama-Adapters (ветка main), пулл-реквест оттуда. Здесь он лежит, чтобы его можно
// было прочитать, обсудить и не потерять между сессиями. Инструкция по подаче — README рядом.
//
// Образец — `projects/hookers/index.js`: лаунчпад Uniswap V4 на той же цепи, устроенный так же
// (одна односторонняя позиция на запуск, её держит отдельный контракт). Повторяем его структуру
// намеренно: адаптер, похожий на уже принятый, ревьюится быстрее, чем самобытный.

const { getLogs2 } = require('../helper/cache/getLogs')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')

// heks — лаунчпад монет на Robinhood Chain. Монета выходит сразу в пул Uniswap V4 односторонней
// позицией: весь выпуск кладётся в диапазон выше стартовой цены, и пул наполняется валютой пары по
// мере того, как люди покупают.
//
// Позицию держит V2PositionVault напрямую в общем PoolManager. Отдельного контракта на пул нет и
// LP-NFT нет, поэтому баланс прочитать не у чего: резервы выводятся из ликвидности позиции, её
// диапазона тиков и текущей цены пула. Ровно та же причина описана в адаптере armsys — синглтон
// PoolManager держит резервы всех пулов сети сразу, и доля отдельного протокола из его баланса не
// вычисляется.
//
// https://robinhoodchain.blockscout.com/address/0x62cA64f87E051a2E190d17caA98E4a08f4a597dc
const LAUNCHPADS = [
  // Действующий набор. Новые монеты создаются здесь.
  { launchpad: '0x62cA64f87E051a2E190d17caA98E4a08f4a597dc', vault: '0x89c0983D9B01F6CAe4FEcbb6b5D6296b44536400', fromBlock: 62705679 },
  // Прежний набор: создание закрыто 2026-09-15, но позиции залочены и продолжают торговаться,
  // поэтому заблокированная в них ликвидность — по-прежнему ликвидность heks.
  { launchpad: '0x0647b0f4bFDEC1f64ffaD55Edcf24504269058de', vault: '0x3025685BE0c6Fa2Ce7ec3Ed6CdBdAF2E6309638f', fromBlock: 56970549 },
]

// Uniswap V4 StateView на Robinhood Chain — то же развёртывание, которым в этом репозитории уже
// пользуются адаптеры V4 на этой цепи.
const STATE_VIEW = '0xF3334192D15450CdD385c8B70e03f9A6bD9E673b'

// Позиция открывается с нулевой солью, поэтому её ключ — это (владелец, tickLower, tickUpper).
const ZERO_SALT = '0x' + '0'.repeat(64)

const ABI = {
  tokenCreated:
    'event TokenCreated(address indexed token, address indexed creator, address indexed numeraire, bytes32 poolId, int24 derivedTick, uint160 sqrtPriceX96, int24 tickLower, int24 tickUpper, int256 feedAnswer, uint256 feedUpdatedAt, uint256 launchFee, uint256 devBuyIn, uint256 devBuyOut, uint256 xKey, uint256 uiMultiplier, string metaURI)',
  getSlot0:
    'function getSlot0(bytes32 poolId) view returns (uint160 sqrtPriceX96, int24 tick, uint24 protocolFee, uint24 lpFee)',
  getPositionInfo:
    'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128)',
}

async function tvl(api) {
  // 1. Перечисляем запуски. Одно событие несёт всё, что нужно дальше: обе валюты пула, его id и
  //    диапазон тиков позиции — дочитывать конфигурацию ниоткуда не приходится.
  const launches = []
  for (const set of LAUNCHPADS) {
    const logs = await getLogs2({
      api,
      target: set.launchpad,
      eventAbi: ABI.tokenCreated,
      fromBlock: set.fromBlock,
      extraKey: set.launchpad,
    })
    for (const l of logs) {
      launches.push({
        token: l.token,
        numeraire: l.numeraire,
        poolId: l.poolId,
        vault: set.vault,
        tickLower: Number(l.tickLower),
        tickUpper: Number(l.tickUpper),
      })
    }
  }
  if (!launches.length) return

  // 2. Текущая цена пула и ликвидность, которую PoolManager действительно записал за позицией.
  //    Ликвидность берётся у Uniswap, а не из нашей собственной бухгалтерии: так число отражает то,
  //    что лежит на самом деле.
  const [slot0, positionInfo] = await Promise.all([
    api.multiCall({
      abi: ABI.getSlot0,
      target: STATE_VIEW,
      calls: launches.map((l) => ({ params: [l.poolId] })),
    }),
    api.multiCall({
      abi: ABI.getPositionInfo,
      target: STATE_VIEW,
      calls: launches.map((l) => ({ params: [l.poolId, l.vault, l.tickLower, l.tickUpper, ZERO_SALT] })),
    }),
  ])

  // 3. Выводим резервы. V4 упорядочивает валюты по адресу, поэтому у пары с нативной монетой
  //    (нулевой адрес) первой всегда идёт она.
  launches.forEach((l, i) => {
    const s = slot0[i]
    if (!s || !s.sqrtPriceX96 || s.sqrtPriceX96 === '0') return

    const liquidity = Number(positionInfo[i]?.liquidity || 0)
    if (!liquidity) return

    const numeraireIsCurrency0 = l.numeraire.toLowerCase() < l.token.toLowerCase()
    const [token0, token1] = numeraireIsCurrency0 ? [l.numeraire, l.token] : [l.token, l.numeraire]

    addUniV3LikePosition({
      api,
      token0,
      token1,
      liquidity,
      tickLower: l.tickLower,
      tickUpper: l.tickUpper,
      tick: Number(s.tick),
    })
  })
}

module.exports = {
  methodology:
    'TVL is the liquidity heks locks in the Uniswap V4 PoolManager across every coin it has launched. Each launch seeds one one-sided position owned by the launchpad vault, so the pair asset buyers pay in accumulates there and only fees can leave. Launches are read from the launchpad\'s TokenCreated logs, which carry both currencies and the position\'s tick range; the position\'s liquidity is read from Uniswap V4 StateView, and the reserves are derived from that liquidity, the tick range and the pool\'s current price. Both sides of each position are counted, so a launched coin contributes only once it has a price of its own.',
  start: '2026-09-10',
  // Это пулы Uniswap V4, и те же средства уже считает адаптер uniswap-v4, который на этой цепи
  // читает сырые балансы PoolManager.
  doublecounted: true,
  robinhood: { tvl },
}
