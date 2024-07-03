const { sumTokensExport } = require('../helper/unknownTokens')

module.exports = {
  haqq: {
    tvl: sumTokensExport({
      owners: [
        '0xf79B598E856858527573cE0771b872C88887a055', // creditDatabase contract
        '0x3B724e84Fd7479C1bed10cAf8eed825dad852C1b', // microcreditinvestment contract
        '0x78ed6350E3E4A0Fa59C48DA702d66cEe90F38BDB', // microcreditprofitshare contract
      ],
      tokens: [ 
        '0xe5CeD8244f9F233932d754A0B1F7268555FBd3B5', 
        '0x829e43f497b8873fA5c83FcF665b96A39a1FBeD6', 
      ],
    }),
  },
}
