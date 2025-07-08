const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

const tpd = "0xd0253dbe5606c9fa01db67eb10be5c3675c2b117";
const tpdStaking = "0xAeab776bE63580cB86309CedB49769e6526abbf4";
const treasury = "0x3287f25f8F29e5d65cE566E5a2a1bd336431d8db";
const treasuryTokens = [
  ADDRESSES.bsc.BUSD, // BUSD
  ADDRESSES.bsc.WBNB, // WBNB
  "0x50bc855ad6a3983589927e5bf3ac0688364ffa64" // TPD-BUSD CAKE LP
];

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owner: treasury, tokens: treasuryTokens}),
    staking: sumTokensExport({ owner: tpdStaking, tokens: [tpd]}),
  }
}
