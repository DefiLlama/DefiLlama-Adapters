const { sumTokens2 } = require("../helper/solana");
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl() {
    // Sum up assets in sUSD pool
    return sumTokens2({
        tokensAndOwners: [
          ['BnANu5CtUogLqcvBNByJuwaRvRxNtVuDcAytwjsUUtqs', 'FhVcYNEe58SMtxpZGnTu2kpYJrTu2vwCZDGpPLqbd2yG'],
          [ADDRESSES.solana.USDC, 'FhVcYNEe58SMtxpZGnTu2kpYJrTu2vwCZDGpPLqbd2yG'],
        ]
    })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "sUSD TVL is calculated by summing all assets backing the stablecoin",
  solana: { tvl },
};