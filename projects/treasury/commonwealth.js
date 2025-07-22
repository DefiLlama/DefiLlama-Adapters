const { treasuryExports } = require("../helper/treasury");

const owners = [
  '0xdE70B8BC5215BdF03f839BB8cD0F639D4E3E2881',
  '0xA205fD6A798A9Ba8b107A00b8A6a5Af742d6aCb5',
  '0x990eCdf73704f9114Ee28710D171132b5Cfdc6f0',
  '0xa653879692D4D0e6b6E0847ceDd58eAD2F1CC136'
]

const WLTH = '0x99b2B1A2aDB02B38222ADcD057783D7e5D1FCC7D';
module.exports = treasuryExports({
  base: { owners, ownTokens: [WLTH], },
})
