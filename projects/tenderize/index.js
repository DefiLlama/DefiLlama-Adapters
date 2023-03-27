const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request');
const BigNumber = require('bignumber.js');
const { transformArbitrumAddress } = require('../helper/portedTokens');

const ethereumEndpoint =
  'https://api.thegraph.com/subgraphs/name/tenderize/tenderize-ethereum';
const arbitrumEndpoint =
  'https://api.thegraph.com/subgraphs/name/tenderize/tenderize-arbitrum';

const configsQuery = gql`
  {
    configs {
      id
      tenderSwap
      tenderizer
      steak
    }
  }
`;

const currentPrincipalQuery = gql`
  query getTenderizer($id: ID!) {
    tenderizer(id: $id) {
      currentPrincipal
    }
  }
`;

const addBNstr = (a, b) => {
  return BigNumber(+a + +b).toFixed(0);
};

async function fetchArbitrum(timestamp, ethBlock, chainBlocks) {
  const graphQLClient = new GraphQLClient(arbitrumEndpoint);
  const configsResult = await graphQLClient.request(configsQuery)

  const deploymentConfigs = configsResult.configs;
  const tvlData = {};
  for (const config of deploymentConfigs) {
    const result = await graphQLClient.request(currentPrincipalQuery, {
      id: config.id,
    });

    const token1Balance = await sdk.api.abi.call({
      block: chainBlocks['arbitrum'],
      target: config.tenderSwap,
      abi: "uint256:getToken1Balance",
      chain: 'arbitrum'
    });

    const tokenAddress = (await transformArbitrumAddress())(config.steak);
    tvlData[tokenAddress] = addBNstr(
      result.tenderizer.currentPrincipal,
      token1Balance.output
    );
  }

  return tvlData;
}

async function fetchEthereum(timestamp, ethBlock, chainBlocks) {
  const graphQLClient = new GraphQLClient(ethereumEndpoint);
  const configsResult = await graphQLClient.request(configsQuery)

  const deploymentConfigs = configsResult.configs;
  const tvlData = {};
  for (const config of deploymentConfigs) {
    const result = await graphQLClient.request(currentPrincipalQuery, {
      id: config.id,
    });

    const token1Balance = await sdk.api.abi.call({
      block: ethBlock,
      target: config.tenderSwap,
      abi: "uint256:getToken1Balance",
    });

    tvlData[config.steak] = addBNstr(
      result.tenderizer.currentPrincipal,
      token1Balance.output
    );
  }

  return tvlData;
}

module.exports = {
  methodology: `Staked tokens are counted as TVL in the chain they are staked on. Non-derivative tokens in the TenderSwap liquidity pools are also counted as TVL.`,
  doublecounted: true,
  ethereum: {
    tvl: fetchEthereum,
  },
  arbitrum: {
    tvl: fetchArbitrum,
  },
};
