const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");
const { ethers } = require('ethers')

const { getInfoTokens } = require('./helpers/infoTokens')

const GET_COLLATERALS = gql`
  query getCollaterals {
    collaterals {
      id
      feeReserves
      guaranteedUsd
      ndolAmounts
      reservedAmounts
      poolAmounts
      cumulativeFundingRate
      lastFundingTime
      utilisationRate
      longLiquidations
      shortLiquidations
      longs
      shorts
      longOpenInterest
      shortOpenInterest
    }
  }
`;

const MAINNET = 1313161554;
const CHAIN_ID = MAINNET
const NECC_SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/rej156/necc-aurora";

async function tvl(timestamp, block) {
  const balances = {}
  const { collaterals } = await request(NECC_SUBGRAPH_URL, GET_COLLATERALS, {
    block,
  });

  const infoTokensData = getInfoTokens(CHAIN_ID, collaterals);

  for (let i = 0; i < infoTokensData.infoTokens.length; i++) {
    const token = infoTokensData.infoTokens[i];
    balances[token.symbol] = BigNumber(ethers.utils.formatUnits(token.poolAmounts, token.decimals))
  }

  return balances;
}

module.exports = {
  aurora: {
    tvl,
  }
}
