const { sumTokens2 } = require('./helper/unwrapLPs')

async function tvl(api) {
  const owner = '0xCe43E857c92195BeB417a167B777a11720e6E355'
  const tokens = [
    '0xf6088cbd287c4d5ab226aaa9b437b27f5dbb5207',
    '0x9d1b716e6bb100d0dc441074dff0326c97ad57d4',
    '0x34943E562503bfEc83250E5069AD21100c2830cD',
    '0x68955aad77823983cda98d047298e74a2fb5bea8',
    '0x6922E64BEe7CF22437eaC06A0063D138479e5cF8',
  ]
  return sumTokens2({ api, owner, tokens, resolveLP: true, })
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl,
  }
};