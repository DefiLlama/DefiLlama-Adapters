const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens } = require('./helper/unwrapLPs')

async function tvl(_, block) {
  return sumTokens({}, [
    [ADDRESSES.ethereum.USDT, '0xb2b7bedd7d7fc19804c7dd4a4e8174c4c73c210d'],
    [ADDRESSES.ethereum.WETH, '0xb2b7bedd7d7fc19804c7dd4a4e8174c4c73c210d'],
    ['0x0316EB71485b0Ab14103307bf65a021042c6d380', '0x7c2d7b53aca4038f2eb649164181114b9aee93cb'],
    [ADDRESSES.ethereum.WETH, '0x7c2d7b53aca4038f2eb649164181114b9aee93cb'],
  ], block)
}

module.exports = {
  ethereum: { tvl }
}
