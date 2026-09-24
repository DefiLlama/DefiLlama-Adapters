const { getUniTVL, staking } = require('../helper/unknownTokens')

// EticaHub on Etica mainnet (chainId 61803). Addresses:
// https://github.com/iamdexx/etica-hub/blob/main/packages/shared/src/addresses.ts
const ETI = '0x34c61EA91bAcdA647269d4e310A86b875c09946f' // Etica protocol token (coingecko: etica)
const ETX = '0xa5A1Bc6307b0b87989B8456D4b35F88a68650044' // EticaHub token
const WEGAZ = '0x232fb2B87CAce92B2438054A7eB79B4081E3E11a' // wrapped EGAZ (Etica gas coin)
const SWAP_FACTORY = '0xfc8dE5A5087c8825AA54E2C57B3FFe0e23784bc3' // EticaSwap V2 factory
const STAKED_ETX = '0x75d81d03a98CD9195593b8963aF17E13fAa70334' // stETX ERC-4626 vault
const ETI_ETX_PAIR = '0x88f179117BE4402a71ca3e9094E7942D03Db84b3'
const WEGAZ_ETX_PAIR = '0xa18050ABE8d4b9384fE3b88D3b88eC311e8CcdF8'

// ETI is the only Etica asset with an external price (coingecko: etica); ETX is priced
// through the ETI/ETX pair. EGAZ has no listing and sits two hops from ETI
// (WEGAZ -> ETX -> ETI), which the unknown-token helper does not chain, so the WEGAZ
// held in pools is converted to ETI here and the helper is told to skip it.
const coreAssets = [ETI]

const uniTvl = getUniTVL({ factory: SWAP_FACTORY, coreAssets, blacklistedTokens: [WEGAZ, STAKED_ETX] })

const getReservesAbi = 'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'

async function etxReserves(api, pair) {
  const [token0, r] = await Promise.all([
    api.call({ abi: 'address:token0', target: pair }),
    api.call({ abi: getReservesAbi, target: pair }),
  ])
  return token0.toLowerCase() === ETX.toLowerCase()
    ? { etx: +r.reserve0, other: +r.reserve1 }
    : { etx: +r.reserve1, other: +r.reserve0 }
}

async function addWegazAsEti(api) {
  const [wegazPool, etiPool] = await Promise.all([
    etxReserves(api, WEGAZ_ETX_PAIR),
    etxReserves(api, ETI_ETX_PAIR),
  ])
  if (!wegazPool.other || !etiPool.etx) return
  const etiPerWegaz = (wegazPool.etx / wegazPool.other) * (etiPool.other / etiPool.etx)
  api.add(ETI, Math.round(wegazPool.other * etiPerWegaz))
}

async function tvl(api) {
  api.addBalances(await uniTvl(api))
  await addWegazAsEti(api)
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL is the value of tokens in EticaSwap V2 pools. ETX is priced through the ETI/ETX pool (ETI = coingecko:etica) ' +
    'and EGAZ (held as WEGAZ) through the WEGAZ/ETX and ETI/ETX pools. Staking is the ETX deposited in the stETX ' +
    'ERC-4626 vault; stETX held in pools is excluded because its underlying ETX is already counted under staking.',
  etica: {
    tvl,
    staking: staking({
      owner: STAKED_ETX,
      tokens: [ETX],
      lps: [ETI_ETX_PAIR],
      coreAssets,
    }),
  },
}
