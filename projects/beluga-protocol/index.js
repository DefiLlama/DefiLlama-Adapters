const { sumTokens2, } = require('../helper/solana')

const tokens = {
  usdt: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  usdc: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
}

const pools = {
  '2usd': {
    owner: '37YxD3yze3v92pFdER4X5ymUbLSmRoMP99WDgA18Gt8k',
    tokens: [tokens.usdc, tokens.usdt,],
  }
}

async function tvl() {
  const tokensAndOwners = Object.values(pools).map(({ owner, tokens}) => tokens.map(i => ([i, owner]))).flat()
  return sumTokens2({ tokensAndOwners })
}

module.exports = {
  timetravel: false, 
  solana: {
    tvl,
  },
  methodology: 'TVL consists of staked tokens',
}
