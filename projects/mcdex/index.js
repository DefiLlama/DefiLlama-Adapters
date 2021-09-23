const sdk = require('@defillama/sdk');
const {GraphQLClient, gql} = require('graphql-request')
const {toUSDTBalances} = require('../helper/balances');
const {getBlock} = require('../helper/getBlock');
const _ = require('underscore');
const axios = require('axios');

async function GenerateCallList() {
const markets = (await axios.get('https://mcdex.io/api/markets')).data.data.markets;
const marketStatus = (await axios.get('https://mcdex.io/api/markets/status')).data.data;
let id2Info = {};
_.forEach(markets, market => {
  const id = market.id;
  if (market.contractType === 'Perpetual') {
    id2Info[id] = { perpetualAddress: market.perpetualAddress };
  }
});
_.forEach(marketStatus, status => {
  if(status===null){
     return;
  }
  const id = status.marketID;
  if (id2Info[id] && status.perpetualStorage && status.perpetualStorage.collateralTokenAddress !== '0x0000000000000000000000000000000000000000') {
    id2Info[id].collateralTokenAddress = status.perpetualStorage.collateralTokenAddress;
  }
});
let calls = []
_.map(id2Info, (info, id) => {
  if (info.collateralTokenAddress && info.perpetualAddress) {
    calls.push({
      target: info.collateralTokenAddress,
      params: info.perpetualAddress
    })
  }
});
return calls;
}


async function ethereum(timestamp, block) {
  const ethBalance = (await sdk.api.eth.getBalance({ target: '0x220a9f0DD581cbc58fcFb907De0454cBF3777f76', block })).output;
  let balances = {
    "0x0000000000000000000000000000000000000000": ethBalance,
  };

  const erc20Calls = await GenerateCallList();
  const balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: erc20Calls,
    abi: 'erc20:balanceOf'
  });

  await sdk.util.sumMultiBalanceOf(balances, balanceOfResults);
  return balances;
}


async function getTVL(subgraphName, block) {
    const endpoint = `https://api.thegraph.com/subgraphs/name/mcdexio/${subgraphName}`
    const graphQLClient = new GraphQLClient(endpoint)

    const query = gql`
  query getTvl($block: Int) {
  factories(
    block: { number: $block }
  ) {
    id
    totalValueLockedUSD
  }
}
  `;
    const results = await graphQLClient.request(query, {
        block
    })
    return results.factories[0].totalValueLockedUSD;
}

async function arbitrum(timestamp, ethBlock, chainBlocks) {
    return toUSDTBalances(await getTVL("mcdex3-arb-perpetual", await getBlock(timestamp, "arbitrum", chainBlocks)))
}

module.exports = {
    misrepresentedTokens: true,
    methodology: `Includes all locked liquidity in AMM pools, pulling the data from TheGraph hosted 'mcdexio/mcdex3-arb-perpetual' subgraph`,
    arbitrum: {
        tvl: arbitrum
    },
    ethereum:{
      tvl: ethereum
    },
    tvl: sdk.util.sumChainTvls([arbitrum, ethereum])
}
