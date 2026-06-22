const { sumTokens } = require('../helper/chain/aleo');

module.exports = {
  timetravel: false,
  methodology: "TVL is the sum of all Aleo credits staked in the Pondo staking pool",
  aleo: {
    tvl: (api) => sumTokens({
      api,
      owners: ['pondo_protocol.aleo']
    })
  }
}
