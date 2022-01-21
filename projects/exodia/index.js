const { sumTokens } = require("../helper/unwrapLPs");
const sdk = require('@defillama/sdk');
const { transformFantomAddress } = require("../helper/portedTokens");
const { request, gql } = require("graphql-request");

const ExodStaking = "0x8b8d40f98a2f14e2dd972b3f2e2a2cc227d1e3be"
const exod = "0x3b57f3feaaf1e8254ec680275ee6e7727c7413c7"
const wsexod = "0xe992C5Abddb05d86095B18a158251834D616f0D1"
const gohm = "0x91fa20244fb509e8289ca630e5db3e9166233fdc"
const mai = "0xfb98b335551a418cd0737375a2ea0ded62ea213b"
const treasury = "0x6a654d988eebcd9ffb48ecd5af9bd79e090d8347"
const dai = "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e"
const wftm = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83"

const graphUrl = "https://api.thegraph.com/subgraphs/name/exodiafinance/exodia-subgraph"
const GET_TREASURY_BALANCES = gql`
query GET_TREASURY_BALANCES($timestamp: BigInt) {
  protocolMetrics(where: {timestamp_lt: $timestamp}, first: 1, orderBy: timestamp, orderDirection: desc) {
    treasuryMaiBalance
    treasuryDaiMarketValue
    treasuryGOhmBalance
    treasuryMonolithExodBalance
    treasuryMonolithWFtmBalance
    treasuryMonolithWsExodBalance
  }
}
`;

const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const transformAddress = await transformFantomAddress();

  await sumTokens(balances, [[exod, ExodStaking]], chainBlocks.fantom, 'fantom', transformAddress)

  return balances;
};

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const transformAddress = await transformFantomAddress();

  const { protocolMetrics } = await request(
    graphUrl,
    GET_TREASURY_BALANCES,
    { timestamp },
  );
  const treasuryBalances = protocolMetrics[0]

  let wFTMBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    target: wftm,
    params: treasury,
    block: chainBlocks.fantom,
    chain: 'fantom'
  })).output;
  wFTMBalance = Number(wFTMBalance) + Number(treasuryBalances.treasuryMonolithWFtmBalance).toFixed(18) * 10**18

  sdk.util.sumSingleBalance(balances, transformAddress(wftm), wFTMBalance) //wFTM
  sdk.util.sumSingleBalance(balances, transformAddress(mai), Number(treasuryBalances.treasuryMaiBalance).toFixed(18) * 10**18) //MAI
  sdk.util.sumSingleBalance(balances, transformAddress(dai), Number(treasuryBalances.treasuryDaiMarketValue).toFixed(18) * 10**18) //DAI
  sdk.util.sumSingleBalance(balances, transformAddress(gohm), Number(treasuryBalances.treasuryGOhmBalance).toFixed(18) * 10**18) //gOHM
  sdk.util.sumSingleBalance(balances, transformAddress(exod), Number(treasuryBalances.treasuryMonolithExodBalance).toFixed(18) * 10**9) //EXOD
  sdk.util.sumSingleBalance(balances, transformAddress(wsexod), Number(treasuryBalances.treasuryMonolithWsExodBalance).toFixed(18) * 10**18) //wsEXOD
  
  return balances;
}

module.exports = {
  fantom: {
    tvl,
    staking
  },
  methodology:
    "Counts tokens on the treasury for TVL and staked EXOD for staking",
};