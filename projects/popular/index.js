const ADDRESSES = require('../helper/coreAssets.json')
const sui = require('../helper/chain/sui')

// POPULAR, a memecoin launchpad on Sui: https://popularsui.xyz (contracts and data: https://popularsui.xyz/data/integrators)
// Type origins (the package that first defined each type; later upgrades keep these ids).
const CURVE = '0x918d32f8a0b349584e96113ec425708374161d4798f8c28d63362602831b33ef::curve::Curve' // SUI bonding curves
const QCURVE = '0xfe9f27187eff1c0d1bb236166df360d0c12be4c0bd99d40ce1d3a51771cbe428::qcurve::QCurve' // curves priced in USDC, wBTC, ETH, XAUM
const LEND = '0xed3220b79cb14da863fe5cb746a3a69a47c1be4080ddc60b63c1defdff98f8c3' // lending vaults and loans

const typeArgs = (type) => type.slice(type.indexOf('<') + 1, type.lastIndexOf('>')).split(',').map(i => i.trim())

// Quote coins raised on curves that have not graduated yet. A graduated curve's liquidity sits in a Cetus pool with its
// LP position burned, so it is counted by Cetus, not here; the launched tokens themselves are not counted.
async function curves(api) {
  const sCurves = await sui.getObjectsByType(CURVE)
  sCurves.forEach(i => api.add(ADDRESSES.sui.SUI, i.fields.sui_reserve))
  const qCurves = await sui.getObjectsByType(QCURVE)
  qCurves.forEach(i => api.add(typeArgs(i.type)[1], i.fields.quote_reserve))
}

// POPULAR's own token. It is never TVL: POP held by the lending contracts is reported under staking instead.
const POP = '0xf37a4ca45f2e1f14352c24485aa774888ccb6ac969cde3ef3443ba7d9e957bba::pop::POP'
const isPop = (type) => type.replace(/^0x0*/, '') === POP.replace(/^0x0*/, '')

// Lending: cash idle in the vaults, plus the collateral locked in open loans: peer-to-peer loans (`loan::Loan<C, L>`) and
// the vaults' own loans and shorts (`safe::SafeLoan<C, L>`). What is lent out is reported as borrowed.
// `pop` false adds every coin but POP, true adds POP only (for staking).
async function lending(api, pop) {
  const add = (type, amount) => { if (isPop(type) === pop) api.add(type, amount) }
  const vaults = await sui.getObjectsByType(`${LEND}::vault::Vault`)
  vaults.forEach(i => add(typeArgs(i.type)[0], i.fields.cash))
  const loans = await sui.getObjectsByType(`${LEND}::loan::Loan`)
  loans.forEach(i => add(typeArgs(i.type)[0], i.fields.collateral))
  const safeLoans = await sui.getObjectsByType(`${LEND}::safe::SafeLoan`)
  safeLoans.forEach(i => add(typeArgs(i.type)[0], i.fields.collateral))
}

async function tvl(api) {
  await curves(api)
  await lending(api, false)
}

async function staking(api) {
  await lending(api, true)
}

async function borrowed(api) {
  const vaults = await sui.getObjectsByType(`${LEND}::vault::Vault`)
  vaults.forEach(i => { const type = typeArgs(i.type)[0]; if (!isPop(type)) api.add(type, i.fields.lent) })
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts the quote coins (SUI, USDC and others) held by bonding curves that have not graduated yet, the cash in the lending vaults and the collateral locked in open loans (peer-to-peer and vault loans). Graduated tokens trade in Cetus pools whose LP is burned, counted under Cetus. Borrowed is the principal lent out by the lending vaults. POP, the project\'s own token, is never TVL: POP in the lending contracts is reported as staking.',
  sui: { tvl, borrowed, staking },
}
