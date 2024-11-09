const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens')
const {staking} = require("../helper/staking");

const pool = [
  '0x5E51E0a62121f3edDe63a45DaA178C1107EA8ee1',
  '0xE32C24CA6AddEb28F28e6361c88Ca41FB24a62Bc',
  '0x177b396560cDDB3876a32BEDA1887476566C1f1a'
];
const contractAddr = ADDRESSES.rpg.WRPG;
module.exports = {
  misrepresentedTokens: true,
  rpg: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x1589DD24f11e1e49566fE99744E7487CbcAb2d43',
    }),
    staking: staking(pool,contractAddr)
  }
}