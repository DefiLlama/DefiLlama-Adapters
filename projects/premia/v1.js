const ADDRESSES = require('../helper/coreAssets.json')
const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk')

const Token = gql`
  fragment Token on Token {
    id
    name
    symbol
    decimals
    address
  }
`;

const TokenPair = gql`
  ${Token}
  fragment TokenPair on TokenPair {
    id
    name
    token {
      ...Token
    }
    denominator {
      ...Token
    }
    strikePriceIncrement
    openInterest
    totalVolume
  }
`;

const getTokenPairs = gql`
  ${TokenPair}
  query TokenPairs(
    $denominatorAddress: String!
    $block: Int
    $first: Int = 100
    $skip: Int = 0
  ) {
    tokenPairs(
      where: { denominator: $denominatorAddress }
      block: { number: $block }
      first: $first
      skip: $skip
    ) {
      ...TokenPair
    }
  }
`;

const graphUrls = {
    ethereum: 'https://api.thegraph.com/subgraphs/name/premiafinance/premia',
    bsc: 'https://api.thegraph.com/subgraphs/name/premiafinance/premia-bsc',
};
const denominators = {
    ethereum: ADDRESSES.ethereum.DAI, //DAI
    bsc: ADDRESSES.bsc.BUSD, //BUSD
}

module.exports = function v1Tvl(chain) {
    return async function tvl(time, ethBlock, chainBlocks) {
        const block = chainBlocks[chain]
        const denominatorAddress = denominators[chain]
        const { tokenPairs } = await request(graphUrls[chain], getTokenPairs, {
            denominatorAddress,
            block
        });

        const balances = {}
        tokenPairs.forEach(pair => {
            sdk.util.sumSingleBalance(balances, chain + ':' + denominatorAddress, pair.openInterest)
        })
        return balances
    }
}