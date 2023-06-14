const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const gg = "0xF2F7CE610a091B94d41D69f4fF1129434a82E2f0"

// https://app.galaxygoggle.money/#/bonds
const treasury = "0xD5F922e23693e552793fE0431F9a95ba67A60A23"
const dao = "0xDEEdd1646984F9372Cc9D3d7E13AC1606cC2B548"
const mim = "0x130966628846BFd36ff31a822705796e8cb8C18D"
const wavax = ADDRESSES.avax.WAVAX
const joe = ADDRESSES.avax.JOE

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [mim, false],
      [wavax, false],
      [joe, false],
      ["0xe9E8d6b6ce6D94Fc9d724711e80784Ec096949Fc", true], // mim-gg
    ],
    [treasury, dao],
    chainBlocks.avax,
    'avax',
    addr=>`avax:${addr}`
  );

  return balances;
}

const bscTreasury = "0xF76C9753507B3Df0867EB02D86d07C6fFcEecaf1";
const treasuryTokensBSC = [
  [ADDRESSES.bsc.BUSD, false], // BUSD
  ["0x13Cf29b3F58f777dDeD38278F7d938401f6b260c", true] // GG-BUSD
]

async function bscTvl(timestamp, block, chainBlocks) {
  let balances = {};
  await sumTokensAndLPsSharedOwners(balances, treasuryTokensBSC, [bscTreasury], chainBlocks.bsc, "bsc", addr=>`bsc:${addr}`);
  balances[`avax:${gg}`] = balances["bsc:0xcaf23964ca8db16d816eb314a56789f58fe0e10e"]  || 0;
  delete balances["bsc:0xcaf23964ca8db16d816eb314a56789f58fe0e10e"];
  return balances;
}

module.exports = {
  avax:{
    tvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  methodology:
    "Counts tokens on the treasury for tvl and staked GG for staking",
};
