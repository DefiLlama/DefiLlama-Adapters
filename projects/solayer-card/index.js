const { sumTokens2 } = require("../helper/solana");
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl() {
    // Sum up assets in sUSD pool
    return sumTokens2({
        tokensAndOwners: [
          [ADDRESSES.solana.USDC, '8eWNJYuALMkMPB24URhg8DYRtxccTUC22xLoTKwnNtUn'],
        ]
    })
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "Solayer Emerald Card TVL is calculated by summing all user deposits",
  solana: { tvl },
};