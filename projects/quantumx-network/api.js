const { getExports } = require('../helper/heroku-api')

module.exports = {
  methodology: "It counts the TVL from the Staking Farms/Pools of QuantumX.",
  timetravel: false,
  misrepresentedTokens: true,
  ...getExports("quantumx-network", ['elrond']),
}
