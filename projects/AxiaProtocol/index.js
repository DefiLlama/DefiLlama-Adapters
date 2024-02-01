const { unwrapBalancerToken } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const axiaPoly = '0x49690541e3f6e933a9aa3cffee6010a7bb5b72d7'
const lonePoolPoly = '0x6c43cd84f2199eef1e7fcf169357b6c7948efe03'
const swapPoolPoly = '0xabf1dafecc1d8b3949092bab9dff8da7d63c69b1'
const swapPoolLPoly = '0xfa447eec17206c4948cba28a229346af925c2b07'

const axiaEth = '0x793786e2dd4cc492ed366a94b88a3ff9ba5e7546'
const lonelyPoolEth = '0x9dEd3b9d0bd9cc4DE698dcebeBb68b1f0033c0C8'
const swapPoolEth = '0xA5130fc368cAAd25450cB5aD1D3718BAB7e558dA'
const swapPoolLPEth = '0x1e0693f129D05E5857A642245185ee1fca6A5096'
const defiFundEth = '0x2b79d8dCbF26c5B690145130006Be06D1324C2b2'
const defiFundLPEth = '0x4833e8b56fc8e8a777fcc5e37cb6035c504c9478'
const oracleFundEth = '0x152959A2f50D716707fEa4897e72C554272dC584'
const oracleFundLPEth = '0xbf11db4e63c72c5dffde0f5831d667817c9e9ad5'

async function tvl(_, _b, _cb, { api, }) {
  const balances = {}

  await Promise.all([
    unwrapBalancerToken({ api, owner: defiFundEth, balancerToken: defiFundLPEth, balances, isBPool: true, isV2: false, }),
    unwrapBalancerToken({ api, owner: oracleFundEth, balancerToken: oracleFundLPEth, balances, isBPool: true, isV2: false, }),
  ])

  return balances
}

module.exports = {
  doublecounted: true,
  polygon: {
    pool2: staking(swapPoolPoly, swapPoolLPoly),
    staking: staking(lonePoolPoly, axiaPoly)
  },

  ethereum: {
    tvl,
    pool2: staking(swapPoolEth, swapPoolLPEth),
    staking: staking(lonelyPoolEth, axiaEth),
  }
}
