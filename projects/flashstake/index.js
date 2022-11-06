const retry = require('async-retry');
const abi = require("./abi.json");
const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request')
const { getBlock } = require('../helper/getBlock');
const { log } = require('../helper/utils');
const axios = require("axios");

// This will get underlying token for a given UNI-LP pool address and amount of
// LP tokens.
async function getUnderlyingTokens(chain, block, poolAddress, amount) {
  let output = {};

  // Retrieve the total LP token supply
  let totalSupply = await sdk.api.abi.call({
    target: poolAddress,
    abi: abi['totalSupply'],
    block: block,
    chain: chain,
  });
  totalSupply = totalSupply['output'];

  // Determine what % is owned
  const percentageOwned = Number(amount) / Number(totalSupply);

  // Retrieve token0 and token1 balances
  const reserves = await sdk.api.abi.call({
    target: poolAddress,
    abi: abi['getReserves'],
    block: block,
    chain: chain,
  });

  let token0Address = await sdk.api.abi.call({
    target: poolAddress,
    abi: abi['token0'],
    block: block,
    chain: chain,
  });
  token0Address = String(token0Address['output']).toLowerCase();
  let token1Address = await sdk.api.abi.call({
    target: poolAddress,
    abi: abi['token1'],
    block: block,
    chain: chain,
  });
  token1Address = String(token1Address['output']).toLowerCase();

  const token0Balance = Number(reserves['output'][0]) * percentageOwned;
  const token1Balance = Number(reserves['output'][1]) * percentageOwned;

  if (!(token0Address in output)) {
    output[token0Address] = 0;
  }
  output[token0Address] = token0Balance;

  if (!(token1Address in output)) {
    output[token1Address] = 0;
  }
  output[token1Address] = token1Balance;

  return output;
}

// This will determine how many LP tokens (FLASH/WETH) are locked in the
// FlashBackLM contracts.
function getPool2(chainObject) {

  const chain = chainObject['chain'];

  return async (_, _b, { [chain]: block }) => {
    let balances = {};

    // If null, skip
    if(chainObject['flashBackLM'] == null) {
      return balances;
    }

    const contractAddresses = chainObject['flashBackLM']['addresses'];

    // Iterate over all above contract addresses
    for(let i = 0; i < contractAddresses.length; i++) {

      // Retrieve the staking token address
      let stakingTokenAddress = await sdk.api.abi.call({
        target: contractAddresses[i],
        abi: abi['stakingTokenAddress'],
        block: block,
        chain: chain,
      });
      stakingTokenAddress = stakingTokenAddress['output'];

      // Retrieve the total number of LP tokens locked
      const totalLPLocked = await sdk.api.abi.call({
        target: contractAddresses[i],
        abi: abi['totalLockedAmount'],
        block: block,
        chain: chain,
      });

      if (!(stakingTokenAddress in balances)) {
        balances[stakingTokenAddress] = 0;
      }
      balances[stakingTokenAddress] += Number(totalLPLocked['output']);
    }
    log("getPool2", chain, block, balances);

    // ==============
    // Resolve the underlying assets from the LP token
    // ==============
    let newBalances = {};
    for(let i = 0; i < Object.keys(balances).length; i++) {
      if (Object.keys(balances)[i] === undefined) {
        break;
      }

      // Retrieve underlying tokens
      const underlyingTokens = await getUnderlyingTokens(
        chain,
        block,
        Object.keys(balances)[i],
        balances[Object.keys(balances)[i]]
      );

      for(let j = 0; j < Object.keys(underlyingTokens).length; j++) {
        const formattedAddress = chain + ":" + Object.keys(underlyingTokens)[j];

        if (!(formattedAddress in newBalances)) {
          newBalances[formattedAddress] = 0;
        }
        newBalances[formattedAddress] += underlyingTokens[Object.keys(underlyingTokens)[j]];
      }
    }
    balances = newBalances;

    return balances;
  }
}


// This will determine how many Flash tokens are locked in the FlashBack
// contracts.
function getStaking(chainObject) {

  const chain = chainObject['chain'];

  return async (_, _b, { [chain]: block }) => {
    block = await getBlock(_, chain, { [chain]: block });

    // If null, skip
    const contractAddress = chainObject['flashBackStakingAddress'];
    if(contractAddress == null) {
      log(chain, block, "Staking contract N/A, skipping");
      return {};
    }

    let stakingTokenAddress = await sdk.api.abi.call({
      target: contractAddress,
      abi: abi['stakingTokenAddress'],
      block: block,
      chain: chain,
    });
    stakingTokenAddress = stakingTokenAddress['output'];

    let totalFlashLocked = await sdk.api.abi.call({
      target: contractAddress,
      abi: abi['totalLockedAmount'],
      block: block,
      chain: chain,
    });
    totalFlashLocked = totalFlashLocked['output'];

    // Format the output to the expected format
    const formattedAddress = chain + ":" + stakingTokenAddress;
    let out = {};
    out[formattedAddress] = totalFlashLocked;
    log("getStaking", chain, block, formattedAddress, totalFlashLocked, out);

    return out;
  }
}

// This will determine the total TVL for the Flashstake Protocol by iterating
// over all registered strategies.
function getTVL(chainObject) {

  const chain = chainObject['chain'];

  return async (_, _b, { [chain]: block }) => {
    let balances = {};

    // Flashstake is a decentralised protocol which can result in anyone making a
    // strategy and reporting fake numbers. The following API is provided by
    // Flashstake DAO and serves as a master list of reviewed/approved strategies
    const whitelistedStrategiesEndpoint = "https://api.flashstake.io/helper/whitelistedStrategies";
    let whitelistedStrategies = await retry(async bail => await axios.get(whitelistedStrategiesEndpoint));
    whitelistedStrategies = whitelistedStrategies['data'];

    block = await getBlock(_, chain, { [chain]: block })

    // If null, skip
    let endpoint = chainObject['endpoint'];
    if(endpoint == null) {
      return {};
    }

    // Retrieve all the supported strategies via subgraph
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

      // Ensure the strategy address is whitelisted
      if(!(String(strategyContractAddress).toLowerCase() in whitelistedStrategies[chain])) {
        log("Skipping non-whitelisted strategy", strategyContractAddress);
        continue;
      }

      // Retrieve the total amount staked by users
      const totalPrincipalStaked = await sdk.api.abi.call({
        target: strategyContractAddress,
        abi: abi['getPrincipalBalance'],
        block: block,
        chain: chain,
      });

      // Retrieve the total yield generated and currently locked in the contract
      const totalYieldBalance = await sdk.api.abi.call({
        target: strategyContractAddress,
        abi: abi['getYieldBalance'],
        block: block,
        chain: chain,
      });

      // Add these two together
      // Add this to the final balances dict
      // Note: There can be more than one strategy with the same principal token
      const formattedAddress = chain + ":" + principalTokenAddress;
      if (!(formattedAddress in balances)) {
        balances[formattedAddress] = 0;
      }
      balances[formattedAddress] += Number(totalPrincipalStaked['output']) + (Number(totalYieldBalance['output']));
    }

    log("getTVL", chain, block, balances);
    return balances;
  }
}

module.exports = {
  misrepresentedTokens: false,
  timetravel: true,
  start: 1659312000,
  hallmarks: [
    [1659312000, "Protocol Launch"],
    [1666641600, "Optimism Deployment"]
  ]
};

// Define all the chain related information
const chains = [
  {
    "chain": "ethereum",
    "endpoint": "https://api.thegraph.com/subgraphs/name/blockzerolabs/flashstake-subgraph",
    "flashTokenAddress": "0xb1f1f47061a7be15c69f378cb3f69423bd58f2f8",
    "flashBackStakingAddress": "0xb89494ab70001a2f25372b5e962046908188feea",
    "flashBackLM": {
      "principalTokenAddress": "0xb1c33de7a914f4d9ba293a055822cbc6e662a698",
      "addresses": [
        "0xcb1205ac28693beda01e0b66e9b4d06231609bfd",
        "0x57d551a18aae2c9de6977425f1df34dcd5db4977",
      ]
    }
  },
  {
    "chain": "optimism",
    "endpoint": "https://api.thegraph.com/subgraphs/name/blockzerolabs/flashstake-subgraph-optimism",
    "flashTokenAddress": "0x86bea60374f220de9769b2fef2db725bc1cdd335",
    "flashBackStakingAddress": null,
    "flashBackLM": null
  }
];

// Iterate over all the chains we are interested in
for(let i = 0; i < chains.length; i++) {
  // Take the chain name
  const chainName = chains[i]['chain'];

  // Retrieve chain related info and add to exports using
  // chain name as key
  module.exports[chainName] = {
    tvl: getTVL(chains[i]),
    pool2: getPool2(chains[i]),
    staking: getStaking(chains[i]),
  }
}
