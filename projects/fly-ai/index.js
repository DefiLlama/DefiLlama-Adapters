const { getConfig } = require('../helper/cache')
const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const FLYAI = '0x0088CE7905025c4B5ea1d49aB6179B6aaADB3B9C'
const STAKING = '0x5279dafA0858d4A5B2DCeb05E5b41f954CD692Cc'
const LOCK = '0x87Ded9d9788a1F6653A0261eF84c56658D0bf5e9'
// Lending shares the wallets hold when their idle USDG is lent out (Steakhouse USDG on Morpho, Spark spUSDG).
const EARN = ['0xBeEff033F34C046626B8D0A041844C5d1A5409dd', '0xde770c84FE66E063336b31737cFE9790f18c4087']
const WALLETS ='https://flyai-mine.fly.dev/api/vaults/leaderboard'

// Each Trader Fly NFT has its own trading wallet. The list of wallet addresses comes from the fly.ai API;
// every balance is read on chain.
async function tvl(api) {
  const { all } = await getConfig('fly-ai/wallets', WALLETS)
  const owners = all.filter((w) => w.chain === 'robinhood' && w.vault).map((w) => w.vault)
  const tokens = [nullAddress, ...Object.values(ADDRESSES.robinhood), ...EARN]
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
