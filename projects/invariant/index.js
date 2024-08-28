const { sumTokens2 } = require('../helper/solana')

async function tvl() {
  return sumTokens2({ owner: 'J4uBbeoWpZE8fH58PM1Fp9n9K6f1aThyeVCyRdJbaXqt' })
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  },
  methodology: "TVL is a sum of the locked capital in each liquidity pool",
};
