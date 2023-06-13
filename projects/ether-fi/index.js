const ADDRESSES = require('../helper/coreAssets.json')
const { GraphQLClient, gql } = require('graphql-request')
const sdk = require('@defillama/sdk');
const axios = require("axios");

const config = {
  GRAPH_URL: "https://api.studio.thegraph.com/query/41778/etherfi-mainnet/0.0.3",
  BEACONCHAIN_URL: "https://beaconcha.in/api/v1/validator",
  LP_ADDRESS: '',
  PAGINATION_LIMIT: 100,
};

const newTVL = async (block, api) => {

  const validators = await queryFromDepositEvent()

  let pubkeyPartitions = []
  let nodeAddresses = []
  // Maps will ensure we will be running in linear time.
  // If we reach something like 10000 validators, we dont want to push iterate something 10000^2 times
  let validatorMapping = new Map()
  let nodeBalanceMapping = new Map()

  let validatorsPerBatch = 100;

  for (const validator of validators) {

    var index = Object.keys(nodeBalanceMapping).length;

    const validatorSubarrayIndex = Math.floor(index / validatorsPerBatch)
    if (!pubkeyPartitions[validatorSubarrayIndex]) {
        pubkeyPartitions[validatorSubarrayIndex] = [];
    }
    pubkeyPartitions[validatorSubarrayIndex].push(validator.validatorPubKey)

    // This will let us access validator data in constant time later on
    validatorMapping[validator.validatorPubKey] = validator
    nodeBalanceMapping[validator.etherfiNode] = validator.validatorPubKey

    nodeAddresses.push(validator.etherfiNode)
  }

  // Get Validator Balances
  const validatorBalances = await pubkeyPartitions.reduce(async (accumulatorPromise, pubkeySet) => {
    const accumulator = await accumulatorPromise;
    const response = await axios.post(config.BEACONCHAIN_URL, {
      indicesOrPubkey: pubkeySet.join(",")
    });
    return accumulator.concat(response.data.data);
  }, Promise.resolve([]));

  for (const balance of validatorBalances) {
    validatorMapping[balance.pubkey] = { ...validatorMapping[balance.pubkey], validatorBalance: balance.balance * (10**9) };
  }

  // Get etherfiNode contract balances
  const {output} = await sdk.api.eth.getBalances({ targets: nodeAddresses, block })

  for (const balance of output) {
    validatorMapping[nodeBalanceMapping[balance.target]] = {...validatorMapping[nodeBalanceMapping[balance.target]], contractBalance: parseInt(balance.balance)}
  }

  // Now that we have out mapping, we can calculate it all together
  let lpTVL = 0;
  let soloStakerTVL = 0;
  Object.values(validatorMapping).forEach(async (validator) => {
    const beaconBalanceEth = validator.validatorBalance

    if (beaconBalanceEth) {
      const balance = beaconBalanceEth + validator.contractBalance
      if (validator.TNFTHolder == config.LP_ADDRESS) {
          lpTVL += balance
      } else {
          soloStakerTVL += balance
      }
    }
  })

  const eapTVL = await api.call({  abi: 'uint256:getContractTVL', target: '0x7623e9DC0DA6FF821ddb9EbABA794054E078f8c4'})

  return {
    soloTVL: soloStakerTVL,
    lpTVL,
    eapTVL: parseInt(eapTVL)
  }
}

const queryFromDepositEvent = async () => {

  const graphQLClient = new GraphQLClient(config.GRAPH_URL);
  const validatorQuery = gql`
    query GetValidators($limit: Int!, $offset: Int!) {
      validators(limit: $limit, offset: $offset) {
        etherfiNode
        TNFTHolder
        validatorPubKey
      }
    }
  `;
  
  try {
    const limit = config.PAGINATION_LIMIT;
    let validators = [];
  
    let offset = 0;
    for (;;) {
      const res = await graphQLClient.request(validatorQuery, { limit, offset });
      const { validators: batch } = res;

      validators.push(...batch);
      offset += limit;
      if (batch.length < limit)  break;
    }
  
    return validators;
  } catch (error) {
    console.error('error: queryFromDepositEvent:', error);
  }
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: async (_, block, _2, { api }) => {
      const {soloTVL, lpTVL, eapTVL} = await newTVL(block, api)
      return {
        ['ethereum:' + ADDRESSES.null]: soloTVL + lpTVL + eapTVL
      }
    }
  }
}