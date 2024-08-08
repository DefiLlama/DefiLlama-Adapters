const { sumTokensExport } = require('../helper/unwrapLPs')

const bridgeTvlWithoutInj = () => sumTokensExport({ owner: '0xf955c57f9ea9dc8781965feae0b6a2ace2bad6f3', fetchCoValentTokens: true, blacklistedTokens: ['0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30'], logCalls: true })

module.exports = {
  methodology: 'Sum of all tokens locked in the Peggy Bridge contract, excluding INJ.',
  ethereum: { tvl: bridgeTvlWithoutInj() },
  injective: { tvl: bridgeTvlWithoutInj() },
};
