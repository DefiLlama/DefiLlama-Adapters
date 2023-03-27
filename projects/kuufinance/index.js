
const { sumTokensExport } = require('../helper/unwrapLPs')

const JITU_CONTRACT_ADDRESS = "0x037BB12721A8876386411dAE5E31ff0c5bA991A8";

module.exports = {
  deadFrom: 1648765747,
  avax:{
    tvl: sumTokensExport({
      owner: JITU_CONTRACT_ADDRESS,
      tokens: [
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB',
        '0x50b7545627a5162F82A992c33b87aDc75187B218',
        '0xc7198437980c041c805A1EDcbA50c1Ce5db95118',
        '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70',
        '0x5947BB275c521040051D82396192181b413227A3'
      ]
    }),
  },
  methodology: `We count as TVL all the assets deposited in JITU contract`,
};
