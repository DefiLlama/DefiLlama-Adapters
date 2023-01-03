const { getTokenAccountBalance } = require('./helper/solana')
const { get } = require('./helper/http')
let _lpData

async function getLPData() {
  if (!_lpData) _lpData = get("https://api.raydium.io/pairs")
  return _lpData
}

async function tvl() {
  const LP_Data = await getLPData()
  const pools = [
    {
      name: 'RAY-USDC-V4',
      mint: 'FbC6K13MzHvN42bXrtGaWsvZY9fxrackRSZcBGfjPc7m',
      tokenAccount: '6v9NUn9gCziTvTepoL2fvegQFPtDPJKneybAzd6jdPDp',
    },
    {
      name: 'RAY-USDT',
      mint: 'C3sT1R3nsw4AVdepvLTLKr5Gvszr7jufyBWUCvy4TUvT',
      tokenAccount: 'HpGnoYvTDvSa7aSmnNCSGLKt56Mdd6HUe5q6Kj4kHjVV',
    },
    {
      name: 'RAY-SRM-V4',
      mint: '7P5Thr9Egi2rvMmEuQkLn8x8e8Qro7u2U7yLD2tU2Hbe',
      tokenAccount: 'DNYv74TeXvcaCBnC4f2jGFFYpc8P5ifDMbEAgEXoAc9h',
    },
    {
      name: 'RAY-SOL-V4',
      mint: '89ZKE4aoyfLBe2RuV6jM3JGNhaV18Nxh8eNtjRcndBip',
      tokenAccount: '61HZrok75Uy4FV4My6kbbW8a5WFkTNvCUemxMrfeka5W',
    },
    {
      name: 'RAY-ETH-V4',
      mint: 'mjQH33MqZv5aKAbKHi8dG3g3qXeRQqq1GFcXceZkNSr',
      tokenAccount: 'DRi5CTWMvsQpxX5twpnCDk1iJpZ2GvNj4QaFQ3dDMhkS',
    }
  ]
  let total = 0
  for (const { mint, tokenAccount } of pools) {
    const lpPrice = LP_Data.find(i => i.lp_mint === 'CGrLpJH8LhrFMEk5hb1JtKyEYz3fuEGY6oYfip2Wztq8')?.lp_price || 0
    const stakedLP = await getTokenAccountBalance('BmDzZtmp6dvjoV6GyWcUGBsEPRhJGKaExiwXq2gyJVp9')
    total += lpPrice * stakedLP
  }
  return {
    'tether': total
  };
}

async function pool2() {
  const LP_Data = await getLPData()
  const lpPrice = LP_Data.find(i => i.lp_mint === 'CGrLpJH8LhrFMEk5hb1JtKyEYz3fuEGY6oYfip2Wztq8').lp_price
  const stakedLP = await getTokenAccountBalance('BmDzZtmp6dvjoV6GyWcUGBsEPRhJGKaExiwXq2gyJVp9')
  return {
    'tether': lpPrice * stakedLP
  };
}

async function staking() {
  return {
    'solyard-finance': await getTokenAccountBalance('Gcdr3WtnnCW1SCDoLQNWXBtmt7xt4x9GEroz3zAfMWys')
  };
}

module.exports = {
  timetravel: false,
  solana: {
    tvl,
    staking,
    pool2,
  },
}
