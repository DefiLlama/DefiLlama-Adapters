const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/solana')

const SOL_MINT = ADDRESSES.solana.SOL
const LP_ACCOUNT = 'GpMZbSM2GgvTKHJirzeGfMFoaZ8UR2X7F4v8vHTvxFbL'
const REWARDS_WALLET = 'EftM2RPnZqLMc3UpE7Xjz41DdtAopYziCmB4r1wVAJ9C'

// native SOL held by the account
const solOf = (account) => (api) => sumTokens2({ api, solOwners: [account] })

const pool2 = solOf(LP_ACCOUNT)
const staking = solOf(REWARDS_WALLET)

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Tracks SOL in the IPLR/SOL LP vault (pool2) and in the rewards wallet (staking).',
  solana: {
    tvl: () => ({}),
    pool2,
    staking
  }
}
