const songbird = require('./songbird.js')
const flare = require('./flare.js')

// node test projects/flarefarm/index.js

module.exports = {
    misrepresentedTokens: true,
  methodology: `Gets token balance from the smart contract address holding the user deposits. These addresses are are labele "tokensAndOwners". SFIN staked to earn more SFIN is labeles as "staking" category`,
  songbird,
   flare
}