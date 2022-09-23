const retry = require('async-retry');
const abi = require("./abi.json");
const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request')

// This will determine how many LP tokens (FLASH/WETH) are locked in the
// FlashBackLM contracts.
async function pool2(timestamp, block) {
  let balances = {};

  const principalTokenAddress = "0xb1c33de7a914f4d9ba293a055822cbc6e662a698";
  const contractAddresses = [
    "0xcb1205ac28693beda01e0b66e9b4d06231609bfd",
    "0x57d551a18aae2c9de6977425f1df34dcd5db4977",
  ];

  // Iterate over all above contract addresses
  for(let i = 0; i < contractAddresses.length; i++) {
    // Retrieve the total number of LP tokens locked
    const totalLPLocked = await sdk.api.abi.call({
      target: contractAddresses[i],
      abi: abi['totalLockedAmount'],
      block: block,
    });

    if (!(principalTokenAddress in balances)) {
      balances[principalTokenAddress] = 0;
    }
    balances[principalTokenAddress] += Number(totalLPLocked['output']);
  }
  return balances;
}

// This will determine how many Flash tokens are locked in the FlashBack
// contracts.
async function staking(timestamp, block) {
  const contractAddress = "0xb89494ab70001a2f25372b5e962046908188feea";

  const totalFlashLocked = await sdk.api.abi.call({
    target: contractAddress,
    abi: abi['totalLockedAmount'],
    block: block,
  });
  return {
    "0xb1f1f47061a7be15c69f378cb3f69423bd58f2f8": totalFlashLocked['output']
  };
}

// This will determine the total TVL for the Flashstake Protocol by iterating
// over all registered strategies.
async function tvl(timestamp, block) {
  let balances = {};

  // Retrieve all the supported strategies via subgraph
  const endpoint = 'https://api.thegraph.com/subgraphs/name/blockzerolabs/flashstake-subgraph';
  const graphQLClient = new GraphQLClient(endpoint)
  const query = gql`
      query Query($block: Int) {
          strategies(first: 1000, block: {number: $block}) {
              id
              principalTokenAddress
          }
      }
  `;

  // Retrieve and iterate over all strategies
  const results = await retry(async bail => await graphQLClient.request(query, {"block": block}));
  for(let i = 0; i < results['strategies'].length; i++) {
    const strategyContractAddress = results['strategies'][i]['id'];
    const principalTokenAddress = results['strategies'][i]['principalTokenAddress'];

    // Retrieve the total amount staked by users
    const totalPrincipalStaked = await sdk.api.abi.call({
      target: strategyContractAddress,
      abi: abi['getPrincipalBalance'],
      block: block,
    });

    // Retrieve the total yield generated and currently locked in the contract
    const totalYieldBalance = await sdk.api.abi.call({
      target: strategyContractAddress,
      abi: abi['getYieldBalance'],
      block: block,
    });

    // Add these two together
    // Add this to the final balances dict
    // Note: There can be more than one strategy with the same principal token
    if (!(principalTokenAddress in balances)) {
      balances[principalTokenAddress] = 0;
    }
    balances[principalTokenAddress] += Number(totalPrincipalStaked['output']) + (Number(totalYieldBalance['output']));
  }

  return balances;
}

module.exports = {
  misrepresentedTokens: false,
  ethereum: {
    staking,
    tvl,
    pool2,
  },
  timetravel: true,
  start: 15450000,
  hallmarks: [
    [1659312000, "Protocol Launch"]
  ]
};
