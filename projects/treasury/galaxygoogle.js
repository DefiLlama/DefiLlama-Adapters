const ADDRESSES = require('../helper/coreAssets.json')

// https://app.galaxygoggle.money/#/bonds
const treasury = "0xD5F922e23693e552793fE0431F9a95ba67A60A23"
const dao = "0xDEEdd1646984F9372Cc9D3d7E13AC1606cC2B548"
const mim = "0x130966628846BFd36ff31a822705796e8cb8C18D"
const wavax = ADDRESSES.avax.WAVAX
const joe = ADDRESSES.avax.JOE

async function tvl(api) {
  return api.sumTokens({ owners: [treasury, dao], tokens: [mim, wavax, joe, "0xe9E8d6b6ce6D94Fc9d724711e80784Ec096949Fc",] });
}

const bscTreasury = "0xF76C9753507B3Df0867EB02D86d07C6fFcEecaf1";
const treasuryTokensBSC = [
  ADDRESSES.bsc.BUSD, // BUSD
  "0x13Cf29b3F58f777dDeD38278F7d938401f6b260c", // GG-BUSD
]

async function bscTvl(api) {
  return api.sumTokens({ owners: [bscTreasury], tokens: treasuryTokensBSC });
}

module.exports = {
  avax: {
    tvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  methodology:
    "Counts tokens on the treasury for tvl and staked GG for staking",
};
