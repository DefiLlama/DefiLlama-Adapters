const { getConfig } = require('../helper/cache')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const FLYAI = '0x0088CE7905025c4B5ea1d49aB6179B6aaADB3B9C'
const STAKING = '0x5279dafA0858d4A5B2DCeb05E5b41f954CD692Cc'
const LOCK = '0x87Ded9d9788a1F6653A0261eF84c56658D0bf5e9'
// Lending shares the wallets hold when their idle USDG is lent out (Steakhouse USDG on Morpho, Spark spUSDG).
const EARN = ['0xBeEff033F34C046626B8D0A041844C5d1A5409dd', '0xde770c84FE66E063336b31737cFE9790f18c4087']
// The other tokens the wallets trade (stock tokens, funds and Robinhood Chain tokens) that coreAssets does not list.
const TRADED = [
  '0x2e8c31162b855a2ffa90f6f8634643ad6f111e18', // AI
  '0x385f4f8ae47651ce5f58f5265395a669f8281e18', // MEME
  '0x4d14284afe559b7c6b9e6fad6ebaeaa0f6051818', // BLORB
  '0xe93237c50d904957cf27e7b1133b510c669c2e74', // MSFT
  '0xdf0992e440dd0be65bd8439b609d6d4366bf1cb5', // CRCL
  '0x117cc2133c37b721f49de2a7a74833232b3b4c0c', // SPY
  '0xd5f3879160bc7c32ebb4dc785f8a4f505888de68', // QQQ
  '0xc9a981fee1f9dec688bb123ccdecc63d0debfc4e', // GLD
  '0x6330d8c3178a418788df01a47479c0ce7ccf450b', // COIN
  '0x894e1ec2d74ffe5aef8dc8a9e84686accb964f2a', // PLTR
  '0xc72b96e0e48ecd4dc75e1e45396e26300bc39681', // INTC
  '0x05a3d1cd21d0c88145e82600e62e7e496e0f222b', // AMC
  '0x1b0e319c6a659f002271b69db8a7df2f911c153e', // GME
  '0xccee82fe024c36fa15e1005ede3e9e4787e23d09', // HIMS
  '0x05b37fb53a299a1b874a619e1c4c404d52c36f4c', // RDDT
  '0x1d11f0496982706c5e14a514d4e79f2e6bde4516', // DJT
  '0x8005d266423c7ea827372c9c864491e5786600ea', // LLY
  '0x4ea005168d7f09a7a0ba9d1def21a479950e44c2', // COST
  '0xf0c4bf4c582cb3836e98394b1d4e7b7281101be8', // RBLX
  '0x5e81213613b6b86eab4c6c50d718d34359459786', // TTWO
  '0x2d427692e928fa156ec22acfabafa0447c5805b7', // GLXY
  '0x411efb0e7f985935daec3d4c3ebaea0d0ad7d89f', // SLV
  '0x92fd66527192e3e61d4ddd13322aa222de86f9b5', // SGOV
  '0xab093def657f15df31b33922a95e047add645b29', // SHROOM
  '0x18e674231a58c239dc7daedcffe15ec3a24cff5c', // HOOKR
  '0x5baaec1b70864f01dbdb747358ff59f2e2ccf7d5', // GIGA
]
const WALLETS = 'https://flyai-mine.fly.dev/api/vaults/leaderboard'

// Each Trader Fly NFT has its own trading wallet. The list of wallet addresses comes from the fly.ai API;
// every balance is read on chain, for every token on the wallets' trading list.
async function tvl(api) {
  const { all } = await getConfig('fly-ai/wallets', WALLETS)
  const owners = all.filter((w) => w.chain === 'robinhood' && w.vault).map((w) => w.vault)
  const tokens = [nullAddress, ...Object.values(ADDRESSES.robinhood), ...EARN, ...TRADED]
  return sumTokens2({ api, owners, tokens, blacklistedTokens: [FLYAI] })
}

// FLYAI staked for the weekly Fly Desk payout, plus FLYAI held in FlyLock (7-day locks).
async function staking(api) {
  const balances = await api.multiCall({ abi: 'erc20:balanceOf', target: FLYAI, calls: [STAKING, LOCK] })
  balances.forEach((b) => api.addCGToken('fly-ai', b / 1e18))
}

module.exports = {
  methodology:
    'TVL is the money owners deposited into their Trader Fly trading wallets (ETH, USDG, stock tokens and other assets, read on chain; FLYAI is left out). Staking is FLYAI in the staking contract and in FlyLock.',
  robinhood: { tvl, staking },
}
