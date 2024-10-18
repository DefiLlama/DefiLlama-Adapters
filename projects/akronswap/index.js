const { getUniTVL } = require('../helper/unknownTokens');

const tvl = getUniTVL({ factory: '0xAf39606bec181887951Ab6912Ac7EA216Bd6E4B4', useDefaultCoreAssets: true, })

module.exports = {
  misrepresentedTokens: true,
  ethereum: { tvl, },
  arbitrum: { tvl, },
  base: { tvl, },
  bsc: { tvl, },
}