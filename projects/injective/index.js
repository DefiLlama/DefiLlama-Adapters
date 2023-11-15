const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'TVL accounts for all liquidity on the Injective chain, using the chain\'s bank module as the source.',
  ethereum: { tvl: sumTokensExport({ owner: '0xf955c57f9ea9dc8781965feae0b6a2ace2bad6f3', fetchCoValentTokens: true, blacklistedTokens: ['0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30'], logCalls: true }) },
};
