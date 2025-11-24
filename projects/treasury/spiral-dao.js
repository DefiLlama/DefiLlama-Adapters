const { treasuryExports } = require("../helper/treasury");

const owners = ['0xc47ec74a753acb09e4679979afc428cde0209639']

const config = {
  ethereum: {
    owners,
    ownTokens: ['0x85b6acaba696b9e4247175274f8263f99b4b9180'],
    tokens: [],
  },
}

module.exports = treasuryExports(config)