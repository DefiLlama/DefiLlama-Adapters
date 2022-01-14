const sdk = require("@defillama/sdk");
const { stakingPricedLP } = require("../helper/staking");
const { sumTokens } = require("../helper/unwrapLPs");
const { getBlock } = require("../helper/getBlock");

const tokens = [
  {
    address: "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED",
    id: "songbird"
  },{
    address: "0xC348F894d0E939FE72c467156E6d7DcbD6f16e21",
    id: "flare-finance"
  },{
    address: "0x70Ad7172EF0b131A1428D0c1F66457EB041f2176",
    id: "usd-coin"
  }
];

const tokensAndOwners = [
    ["0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED", "0x6BA0F675EB2f169D15764D5cf10C4EF0e9e059f2"],
    ["0xC348F894d0E939FE72c467156E6d7DcbD6f16e21", "0xc9231AB30b2B39c1f7f79132D7a44bBF0F8144B0"],
    ["0x70Ad7172EF0b131A1428D0c1F66457EB041f2176", "0x32b36B0A8B74Ac9212946a99e0af727848D5A3A1"]
];

async function farmTvl(timestamp, ethblock, chainBlocks) {
  balances = {};
  block = getBlock(timestamp, 'songbird', chainBlocks, true);
  
  await sumTokens(
    balances,
    tokensAndOwners,
    block,
    "songbird",
  );

  // get decimal places of each token
  const decimals = (await sdk.api.abi.multiCall({
    calls: tokens.map(t=>({
        target: t.address,
    })),
    abi: 'erc20:decimals',
    chain: 'songbird',
    block,
  })).output;

  // iterate through tokens array
  for (let i = 0; i < tokens.length; i++) {
    // decimals for this particular token
    const tokenDecimals = decimals[i].output;

    // check the decimals call worked
    // otherwise it'll divide by 1 and TVL will be trillions
    if (!tokenDecimals) {
      // may want to change this for a less extreme fail case but 
      // probably better if it shows up on outdated if the adapters broken
      return;
    };

    const realBalance = balances[tokens[i].address] / 10 ** tokenDecimals;
    // add a balance for the coingecko API ID
    balances[tokens[i].id] = realBalance;
    // delete the address balance 
    delete balances[tokens[i].address];
  };

  return balances;
};

module.exports = {
  methodology: `Gets token balance from the smart contract address holding the user deposits. These addresses are are labele "tokensAndOwners". SFIN staked to earn more SFIN is labeles as "staking" category`,
  songbird: {
    tvl: farmTvl,
    staking: stakingPricedLP("0x554742076743b366504972F86609d64fd18BDC34", "0x0D94e59332732D18CF3a3D457A8886A2AE29eA1B", "songbird", "0x48195Ca4D228ce487AE2AE1335B017a95493Ade6", "usd-coin" ),
  }
};