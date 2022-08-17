const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking');
const sdk = require('@defillama/sdk');
const yode = "0x6FC4563460d5f45932C473334d5c1C5B4aEA0E01"
const xyode = "0x707Ee40734454162b7720B665Fa2aA0f7c2C6983"

module.exports = {
  misrepresentedTokens: true,
  doublecounted: false,
  dogechain: {
    tvl: getUniTVL({
      chain: 'dogechain',
      coreAssets: ['0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101', '0x6FC4563460d5f45932C473334d5c1C5B4aEA0E01', '0x765277EebeCA2e31912C9946eAe1021199B39C61', '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D'],
      factory: '0xAaA04462e35f3e40D798331657cA015169e005d7',
    }),
    staking: staking(xyode, yode, "dogechain")
  }
}