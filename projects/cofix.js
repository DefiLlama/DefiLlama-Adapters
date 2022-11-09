const { sumTokens } = require('./helper/unwrapLPs')

async function tvl(_, block) {
  return sumTokens({}, [
    ['0xdac17f958d2ee523a2206206994597c13d831ec7', '0xb2b7bedd7d7fc19804c7dd4a4e8174c4c73c210d'],
    ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0xb2b7bedd7d7fc19804c7dd4a4e8174c4c73c210d'],
    ['0x0316EB71485b0Ab14103307bf65a021042c6d380', '0x7c2d7b53aca4038f2eb649164181114b9aee93cb'],
    ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x7c2d7b53aca4038f2eb649164181114b9aee93cb'],
  ], block)
}

module.exports = {
  ethereum: { tvl }
}
