const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const fundStore = "0xED29cB1b164dd7EA1c5065E79a15dA31EC34327B";
const covo = "0x681D3e1b54B3E1a338feB5B076cebf53a697d51F";

module.exports = {
  polygon: {
    tvl: sumTokensExport({ owners: [fundStore], tokens: [
      nullAddress,
      '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',//USDC
    ]}),
    staking: sumTokensExport({ owners: [fundStore], tokens: [covo]})
  },
}
