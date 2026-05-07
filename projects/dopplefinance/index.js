const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const assetsOnExchange = {
  bsc: [
    // * KUSD
    '0x940Ff63e82d15fb47371BFE5a4ed7D7D183dE1A5',
    // * BUSD
    ADDRESSES.bsc.BUSD,
    // * USDT
    ADDRESSES.bsc.USDT,
    // * USDC
    ADDRESSES.bsc.USDC,
    // * DAI
    ADDRESSES.bsc.DAI,
    // * UST
    "0x23396cF899Ca06c4472205fC903bDB4de249D6fC",
    // * BTCB
    ADDRESSES.bsc.BTCB,
    // * renBTC
    '0xfCe146bF3146100cfe5dB4129cf6C82b0eF4Ad8c',
    // * USDN
    '0x03ab98f5dc94996F8C33E15cD4468794d12d41f9',
    // * TUSD
    ADDRESSES.bsc.BTUSD,
    // * DOLLY
    "0xfF54da7CAF3BC3D34664891fC8f3c9B6DeA6c7A5"
  ],
  fantom: [
    // * USDC
    ADDRESSES.fantom.USDC,
    // * fUSDT
    ADDRESSES.fantom.fUSDT,
    // * DAI
    ADDRESSES.fantom.DAI,
    // * MIM
    ADDRESSES.fantom.MIM,
  ],
  harmony: [
    // * KUSD
    '0x60d717d69f964f4b67de9786e1796a4cf0d89940',
    // * 1USDC
    '0x985458e523db3d53125813ed68c274899e9dfab4',
    // * 1USDT
    '0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f',
    // * 1BUSD,
    '0xe176ebe47d621b984a73036b9da5d834411ef734',
    // * bscUSDC
    '0x44cED87b9F1492Bf2DCf5c16004832569f7f6cBa',
    // * bscUSDT
    '0x9A89d0e1b051640C6704Dde4dF881f73ADFEf39a',
    // * bscBUSD
    '0x0aB43550A6915F9f67d0c454C2E90385E6497EaA',
  ]
}

async function bscTVL(_, _b, { bsc: block }) {
  const chain = 'bsc'
  const pools = [
    '0x5162f992EDF7101637446ecCcD5943A9dcC63A8A',
    '0x449256e20ac3ed7f9ae81c2583068f7508d15c02',
    '0x61f864a7dfe66cc818a4fd0baabe845323d70454',
    '0x215b3616730020a7f3e075526588d0cdaa057dca',
    '0x36e04b29169313d93a056289109ba8a8291e69ab',
    '0xbc42fadcc37994c65a559fb7803ed60d90994e9f',
    '0xf8af8659a2af27d65bb3e705f0e97b321886031d',
    '0x830e287ac5947b1c0da865dfb3afd7cdf7900464',
  ]
  const toa = [
    [ADDRESSES.bsc.USDC, '0xa275769Fb6fF34A1a01C8CE61D0182f5d36AD27A',], // USDC collateral for minting KUSD
  ]
  assetsOnExchange.bsc.forEach(t => pools.forEach(o => toa.push([t, o])))
  return sumTokens2({ tokensAndOwners: toa, chain, block, })
}

async function fantom(_, _b, { fantom: block }) {
  const chain = 'fantom'
  const pools = [
    '0x5162f992EDF7101637446ecCcD5943A9dcC63A8A',
  ]
  const toa = []
  assetsOnExchange.fantom.forEach(t => pools.forEach(o => toa.push([t, o])))
  return sumTokens2({ tokensAndOwners: toa, chain, block, })
}

async function harmony(_, _b, { harmony: block }) {
  const chain = 'harmony'
  const pools = [
    '0xccb7c3166729fe92c914fb38b850696748d83db8',
    '0x44a783b046f012287a233e4e51949f47a2279dee',
  ]
  const toa = []
  assetsOnExchange.harmony.forEach(t => pools.forEach(o => toa.push([t, o])))
  return sumTokens2({ tokensAndOwners: toa, chain, block, })
}

module.exports = {
  bsc: {
    tvl: bscTVL,
  },
  fantom: {
    tvl: fantom,
  },
  harmony: {
    tvl: harmony,
  },
}
