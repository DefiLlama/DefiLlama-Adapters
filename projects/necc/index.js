const sdk = require('@defillama/sdk');
const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");
const { ethers } = require('ethers')

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

const NECC_SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/rej156/necc-aurora";

async function tvl(timestamp, block) {
  const balances = {}
  const { collaterals } = await request(NECC_SUBGRAPH_URL, GET_COLLATERALS, {
    block,
  });

  const callsMap = collaterals.map((item) => {
    return { target: item.id }
  })

  const symbols = (await sdk.api.abi.multiCall({
    calls: callsMap,
    abi: 'erc20:symbol',
    block,
    chain: 'aurora'
  })).output

  const decimals = (await sdk.api.abi.multiCall({
    calls: callsMap,
    abi: 'erc20:decimals',
    block,
    chain: 'aurora'
  })).output

  const getTokenSymbol = (tokenAddress) => {
    const itemWithSymbol = symbols.find(s => s.input.target === tokenAddress)
    return itemWithSymbol.output
  }

  const getTokenDecimals = (tokenAddress) => {
    const itemWithDecimal = decimals.find(s => s.input.target === tokenAddress)
    return itemWithDecimal.output
  }

  for (let i = 0; i < collaterals.length; i++) {
    const token = collaterals[i];
    balances[getTokenSymbol(token.id)] = BigNumber(ethers.utils.formatUnits(token.poolAmounts, getTokenDecimals(token.id)))
  }

  return balances;
}

module.exports = {
  aurora: {
    tvl,
  }
}
