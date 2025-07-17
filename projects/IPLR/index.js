const ADDRESSES = require('../helper/coreAssets.json')
const { getTokenBalance } = require('../helper/solana')

const SOL_MINT = ADDRESSES.solana.SOL
const LP_ACCOUNT = 'GpMZbSM2GgvTKHJirzeGfMFoaZ8UR2X7F4v8vHTvxFbL'
const REWARDS_WALLET = 'EftM2RPnZqLMc3UpE7Xjz41DdtAopYziCmB4r1wVAJ9C'

async function pool2() {
  const solBalance = await getTokenBalance(SOL_MINT, LP_ACCOUNT)
  return {
    ['solana:' + ADDRESSES.solana.SOL]: solBalance
  }
}

async function staking() {
  const solBalance = await getTokenBalance(SOL_MINT, REWARDS_WALLET)
  return {
    ['solana:' + ADDRESSES.solana.SOL]: solBalance
  }
}

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
