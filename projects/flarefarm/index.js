const { stakingPricedLP } = require("../helper/staking");
const { sumTokens } = require("../helper/unwrapLPs");
const { getBlock } = require("../helper/getBlock");
const { getFixBalances } = require("../helper/portedTokens");

const tokensAndOwners = [
    ["0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED", "0x6BA0F675EB2f169D15764D5cf10C4EF0e9e059f2"],
    ["0xC348F894d0E939FE72c467156E6d7DcbD6f16e21", "0xc9231AB30b2B39c1f7f79132D7a44bBF0F8144B0"],
    ["0x70Ad7172EF0b131A1428D0c1F66457EB041f2176", "0x32b36B0A8B74Ac9212946a99e0af727848D5A3A1"]
];

const chain = 'songbird'

async function farmTvl(timestamp, ethblock, chainBlocks) {
  let balances = {};
  let block = getBlock(timestamp, chain, chainBlocks, true);
  
  await sumTokens(
    balances,
    tokensAndOwners,
    block,
    chain,
  );

  const fixBalances = await getFixBalances(chain)
  fixBalances(balances)
  return balances;
};

module.exports = {
  methodology: `Gets token balance from the smart contract address holding the user deposits. These addresses are are labele "tokensAndOwners". SFIN staked to earn more SFIN is labeles as "staking" category`,
  songbird: {
    tvl: farmTvl,
    staking: stakingPricedLP("0x554742076743b366504972F86609d64fd18BDC34", "0x0D94e59332732D18CF3a3D457A8886A2AE29eA1B", "songbird", "0x48195Ca4D228ce487AE2AE1335B017a95493Ade6", "usd-coin" ),
  }
};