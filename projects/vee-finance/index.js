const sdk = require("@defillama/sdk");
const { compoundExports2, methodology } = require('../helper/compound')

module.exports = {
  methodology,
}

const pools = {
  avax: {
    pools: [
      ['0xA67DFeD73025b0d61F2515c531dd8D25D4Cfd0Db'],
      ['0xAF7f6F7a1295dEDF52a01F5c3f04Ad1b502CdA6a'],
      ['0x43AAd7d8Bc661dfA70120865239529ED92Faa054', '0x6481490DBb6Bd0e8b7CB7E1317470f6d08aDa5A2'],
      ['0xeEf69Cab52480D2BD2D4A3f3E8F5CcfF2923f6eF', '0x125605c515e3f75CAd62d3613c97A76F13d73A64'],
    ],
  },
  heco: {
    pools: [
      ['0x484C6e804cD4Cc27fCFbCf06748d6b4BCA47db84'],
      ['0x2a144ACaef8fb9258e4f2c2018945a76fE7342E2', '0x0F75aBfef98dAaa7A8170ddA97c8100a65ABA3cC'],
    ],
  },
}

function getTvl(chain) {
  const config = pools[chain] ?? { pools: [] };
  const tvls = config.pools.map(([comptroller, cether]) => compoundExports2({ comptroller, cether }));
  let tvl = sdk.util.sumChainTvls(tvls.map((t) => t.tvl))
  let borrowed = sdk.util.sumChainTvls(tvls.map((t) => t.borrowed))
  return { tvl, borrowed }
}

Object.keys(pools).forEach(chain => module.exports[chain] = getTvl(chain))

module.exports.avax.borrowed = () => ({})