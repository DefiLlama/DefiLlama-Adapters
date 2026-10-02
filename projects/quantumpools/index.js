const { sumTokens2 } = require('../helper/unwrapLPs')

const VAULT = '0x5433f385F538Fa11b8A25B82230a306d25dF8EB3'
// Passed explicitly so Robinhood TVL does not depend on the helper default switch.
const UNI_NFT_ROBINHOOD = '0x73991a25C818Bf1f1128dEAaB1492D45638DE0D3'

async function tvl(api) {
  return sumTokens2({
    api,
    owners: [VAULT],
    resolveUniV3: true,
    uniV3ExtraConfig: { nftAddress: UNI_NFT_ROBINHOOD },
  })
}

module.exports = {
  methodology: 'TVL is the value of every Uniswap V3 concentrated-liquidity position held by the QuantumPools vault, unwrapped to underlying token amounts at the current pool tick.',
  doublecounted: true, // liquidity is already counted in Uniswap V3 TVL; QuantumPools manages those positions
  start: 1790553600, // 2026-09-28 00:00:00 UTC, first deposits
  robinhood: { tvl },
}
