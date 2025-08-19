const sdk = require('@defillama/sdk')
const P = '0x21597Ae2f941b5022c6E72fd02955B7f3C87f4Cb'
const O = '0xCD424ed62c18Df5D15F23799091597C99406B700'
const a = {
  p: 'function getPool() view returns (address)',
  r: 'function getReservesList() view returns (address[])',
  d: {"inputs":[{"name":"asset","type":"address"}],"outputs":[{"name":"availableLiquidity","type":"uint256"},{"name":"totalStableDebt","type":"uint256"},{"name":"totalVariableDebt","type":"uint256"},{"name":"liquidityRate","type":"uint256"},{"name":"variableBorrowRate","type":"uint256"},{"name":"stableBorrowRate","type":"uint256"},{"name":"lastUpdateTimestamp","type":"uint40"},{"name":"id","type":"uint16"},{"name":"aTokenAddress","type":"address"},{"name":"stableDebtTokenAddress","type":"address"},{"name":"variableDebtTokenAddress","type":"address"},{"name":"interestRateStrategyAddress","type":"address"},{"name":"accruedToTreasury","type":"uint128"},{"name":"unbacked","type":"uint128"},{"name":"isolationModeTotalDebt","type":"uint128"}],"name":"getReserveData","type":"function"},
  s: 'function totalSupply() view returns (uint256)',
  g: 'function getLatestPrice(address token) external view returns (uint256 price18)',
  e: 'function decimals() view returns (uint8)',
  y: 'function symbol() view returns (string)'
}
const c = new Map()
async function gp(api, t) {
  const k = t.toLowerCase()
  if (c.has(k)) return c.get(k)
  try {
    const p = await api.call({target: O, abi: a.g, params: [t]})
    c.set(k, p)
    return p
  } catch {c.set(k, '0'); return '0'}
}
async function gd(api, t) {
  try {return parseInt(await api.call({target: t, abi: a.e}))} catch {return 18}
}
async function gs(api, t) {
  try {return await api.call({target: t, abi: a.y})} catch {return t.slice(0, 8)}
}
async function core(api) {
  const pool = await api.call({target: P, abi: a.p})
  const reserves = await api.call({target: pool, abi: a.r})
  const rDatas = await api.multiCall({calls: reserves.map(asset => ({target: pool, params: [asset]})), abi: a.d, permitFailure: true})
  const [aSupplies, stableSupplies, variableSupplies, prices, decimals, symbols] = await Promise.all([
    api.multiCall({calls: rDatas.map((x,i) => ({target: x?.aTokenAddress || reserves[0]})), abi: a.s, permitFailure: true}),
    api.multiCall({calls: rDatas.map((x,i) => ({target: x?.stableDebtTokenAddress || reserves[0]})), abi: a.s, permitFailure: true}),
    api.multiCall({calls: rDatas.map((x,i) => ({target: x?.variableDebtTokenAddress || reserves[0]})), abi: a.s, permitFailure: true}),
    Promise.all(reserves.map(r => gp(api, r))),
    Promise.all(reserves.map(r => gd(api, r))),
    Promise.all(reserves.map(r => gs(api, r)))
  ])
  let tt = 0, tb = 0, td = [], bd = []
  for (let i = 0; i < reserves.length; i++) {
    const s = BigInt(aSupplies[i] || '0'), d = BigInt(stableSupplies[i] || '0') + BigInt(variableSupplies[i] || '0')
    const p = BigInt(prices[i] || '0'), dc = BigInt(10 ** (decimals[i] || 18))
    const tv = Number((s * p) / (BigInt(10 ** 18) * dc)), bv = Number((d * p) / (BigInt(10 ** 18) * dc))
    if (tv > 0) {tt += tv; td.push({s: symbols[i], v: tv})}
    if (bv > 0) {tb += bv; bd.push({s: symbols[i], v: bv})}
  }
  return {tt, tb}
}
async function tvl(api) {const {tt} = await core(api); return api.addUSDValue(Math.round(tt))}
async function borrowed(api) {const {tb} = await core(api); return api.addUSDValue(Math.round(tb))}
module.exports = {pulse: {tvl, borrowed}, methodology: `TVL = aToken totalSupply per reserve; Borrowed = stableDebt + variableDebt. USD prices from BetterBank Oracle (${O}).`}