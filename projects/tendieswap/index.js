const sdk = require("@defillama/sdk");
const tvlOnPairs = require("../helper/processPairs.js");

const factoryBSC = "0xb5b4aE9413dFD4d1489350dCA09B1aE6B76BD3a8";
const masterchef = "0x6dDb25ca46656767f8f2385D653992dC1cdb4470";
const tendie = "0x9853A30C69474BeD37595F9B149ad634b5c323d9"

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  await tvlOnPairs("bsc", chainBlocks, factoryBSC, balances);
  return balances;
};

async function stakingTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const stakedBanana = sdk.api.erc20.balanceOf({
    target: tendie,
    owner: masterchef,
    chain: 'bsc',
    block: chainBlocks.bsc
  })
  sdk.util.sumSingleBalance(balances, 'bsc:' + tendie, (await stakedBanana).output)
  return balances;
}

module.exports = {
  bsc: {
    tvl: bscTvl, 
  },
  staking: {
    tvl: stakingTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl, stakingTvl]),
  methodology: 'TVL counts the liquidity in each of the Tendieswap pairs. Pairs are found using the factory address. Staking TVL accounts for TENDIE on its masterchef contract.'
};