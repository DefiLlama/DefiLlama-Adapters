const { stakingPricedLP } = require("../helper/staking");
const { sumTokens, sumTokensAndLPs } = require("../helper/unwrapLPs");
const { getBlock } = require("../helper/getBlock");
const { getFixBalances } = require("../helper/portedTokens");

const tokens = [
    ["0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED", "0x6BA0F675EB2f169D15764D5cf10C4EF0e9e059f2", false],
    ["0xC348F894d0E939FE72c467156E6d7DcbD6f16e21", "0xc9231AB30b2B39c1f7f79132D7a44bBF0F8144B0", false],
    ["0x70Ad7172EF0b131A1428D0c1F66457EB041f2176", "0x32b36B0A8B74Ac9212946a99e0af727848D5A3A1", false],
    ["0xC6D2f9e21bcD963B42D85379581003be1146b3Aa", "0x02785B7CE6Eb9A5858561DDAB64cCBE5c478b730", true],
    ["0x07852D5C7fd1d630Dd79148A195aaAF72241680D","0x50756c69CAC800a3fA03d130721CDa02Aa0fEF69", true],
    ["0xcd15c231b8a0bae40bd7938ae5ea8e43f1e9a15f", "0x0732f6B4aBE5dB2127E671E4B218d340b6af169c", true],
    ["0xb5bf334b8cc30b8b13fc035d171d77a217aab091", "0x864201b2227Ee23f0875c5D3Fc49F4F0ec59aC19", true],
    ["0x48195ca4d228ce487ae2ae1335b017a95493ade6", "0xc5478a1d5914cF9D0Ee20Da21459502eCb7E1646", true],
    ["0x47c830e141234d029d953df39b13d7728eb9f2d4", "0x921E8f58cF517d289c01BCBE800c2d31838c1a28", true],
    ["0xcd15c231b8a0bae40bd7938ae5ea8e43f1e9a15f", "0x3b343A6FC05B699F48CBe6FF127C0af8e2aA9EEE", true]
];

const chain = 'songbird'

async function farmTvl(timestamp, ethblock, chainBlocks) {
  let balances = {};
  let block = getBlock(timestamp, chain, chainBlocks, true);
  
  await sumTokensAndLPs(
    balances,
    tokens,
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
    staking: stakingPricedLP("0x554742076743b366504972F86609d64fd18BDC34", "0x0D94e59332732D18CF3a3D457A8886A2AE29eA1B", "songbird", "0x48195Ca4D228ce487AE2AE1335B017a95493Ade6", "canary-dollar" ),
  }
};