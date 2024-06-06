const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking');
const { sumTokens2 } = require('../helper/unwrapLPs')

const BUSD_ADDRESS = ADDRESSES.bsc.BUSD;
const gHECTA = '0x7d31ed03c2442f9ffc4f22d90772ee1f32fa9b0d'
const chain = 'bsc'
const HECTA_ADDRESS = "0x343915085b919fbd4414F7046f903d194c6F60EE";
const TREASURY_ADDRESS = "0x4059c4a0b8a2B528C4f2E101A3bB8fB169aBa4fB";
const HECTA_BUSD_ADDRESS = "0xc7cee4cea7c76e11e9f5e5e5cbc5e3b798a1c4d0";

module.exports = {
    methodology:
    "Total Value Lock in Hectagon protocol is calculated by sum of: Treasury locked value",
  start: 20195418,
  bsc: {
    tvl: (_, _b, {[chain]: block}) => sumTokens2({ chain, block, owner: TREASURY_ADDRESS, tokens: [HECTA_BUSD_ADDRESS, BUSD_ADDRESS,]}),
    staking: staking(gHECTA, HECTA_ADDRESS, chain),
  },
};
