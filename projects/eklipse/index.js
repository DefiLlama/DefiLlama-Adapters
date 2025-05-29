const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')
const EKL_TOKEN = '0x807c4e063eb0ac21e8eef7623a6ed50a8ede58ca'
const STAKING_ADDRESS = '0xD067C3b871ee9E07BA4205A8F96c182baBBA6c58'
const POOL2_ADDRESS = '0x625ae9043e8730c4a1e30b36838502fb90e1d3c2'
const USDT_PAIR = '0x219ee5d76593f5bd639125b6411a17d309e3ad31'
const KLAY_PAIR = '0x5db231ac93faaad876155dc0853bb11a2f4b0fb2'

const vaults = [
  '0x4F5d9F3b17988aA047e6F1Bc511fEc0BF25691f4',
  '0xe59234EeDC854b3b37D48EFd8a529069C3990F83',
  '0xddA06aaB425a1A390c131F790A56AB3380e3B7EC',
  '0x7f352a4332fAD433D381d700118f8C9b0A1E1abb',
  '0xB1b782f2D30505e9984e37e00C6494437d94c223',
  '0x75Dc33f8247245E8E08852E68E7f275E2a41fD40',
  '0x4F5d9F3b17988aA047e6F1Bc511fEc0BF25691f4',
  '0x323fdda29fa2B8028eF9Fb48c1D45e5A39214D9A',
  '0x5B4ed8321ea13047195104037798f29257EAc28c',
  '0x29c6Eb808020Ef4889A9f25d35b69edBAfB0C78e',
]
const tokens = [
  ADDRESSES.klaytn.KDAI,
  ADDRESSES.klaytn.oBUSD,
  ADDRESSES.klaytn.oUSDC,
  ADDRESSES.klaytn.KSD,
  ADDRESSES.klaytn.KASH,
  '0x807c4e063eb0ac21e8eef7623a6ed50a8ede58ca',
  ADDRESSES.klaytn.oUSDT,
  ADDRESSES.klaytn.pUSD,
  ADDRESSES.klaytn.USDK,
]


async function tvl(api) {
  return api.sumTokens({ owners: vaults, tokens })
}

async function pool2(api) {
  return sumTokens2({ api, tokens: [USDT_PAIR, KLAY_PAIR], owners: [POOL2_ADDRESS], resolveLP: true, })
}

module.exports = {
  klaytn: {
    tvl,
    staking: staking(STAKING_ADDRESS, EKL_TOKEN),
    pool2,
  },
}

