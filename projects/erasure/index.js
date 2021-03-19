/*==================================================
  Modules
  ==================================================*/

  const sdk = require("@defillama/sdk");
  const _ = require("underscore");
  const BigNumber = require("bignumber.js");

  const abi = require('./abi');

/*==================================================
  Settings
  ==================================================*/

  const instanceCountPerCall = 1000;

  const registryAddresses = [
    '0xa6cf4Bf00feF8866e9F3f61C972bA7C687C6eDbF', // Erasure Agreements
    '0x409EA12E73a10EF166bc063f94Aa9bc952835E93', // Erasure Escrows
    '0x348FA9DcFf507B81C7A1d7981244eA92E8c6Af29' // Erasure Posts
  ];

  const tokenAddresses = [
    '0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671', // NMR
    '0x6B175474E89094C44Da98b954EedeAC495271d0F' // DAI
  ]

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    let balances = {};

    // instances count for each registry
    const instanceCounts = (
      await sdk.api.abi.multiCall({
        calls: _.map(registryAddresses, (registryAddress) => {
          return {
            target: registryAddress
          }
        }),
        abi: abi.getInstanceCount
      })
    ).output;

    let paginatedInstancesCalls = [];

    _.each(instanceCounts, (instanceCount) => {
      const registryAddress = instanceCount.input.target;
      const count = Number(instanceCount.output);

      for(let i = 0; i < count; i += instanceCountPerCall) {
        const from = i;
        let to = i + instanceCountPerCall;

        if(to > count) {
          to = count;
        }

        paginatedInstancesCalls.push({
          target: registryAddress,
          params: [from, to]
        })
      }
    });

    // instances for each registry
    const paginatedInstances = (
      await sdk.api.abi.multiCall({
        calls: paginatedInstancesCalls,
        abi: abi.getPaginatedInstances
      })
    ).output;

    let instanceAddresses = [];

    _.each(paginatedInstances, (instances) => {
      instanceAddresses = [
        ...instanceAddresses,
        ...instances.output
      ]
    });

    instanceAddresses = _.uniq(instanceAddresses);

    let balanceOfCalls = [];

    _.each(instanceAddresses, (instanceAddress) => {
      _.each(tokenAddresses, (tokenAddress) => {
        balanceOfCalls.push({
          target: tokenAddress,
          params: [instanceAddress]
        });
      });
    });

    // call all balances
    const balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls: balanceOfCalls,
      abi: "erc20:balanceOf"
    });

    // sum token balances across contracts
    _.each(balanceOfResults.output, balanceOf => {
      if (balanceOf.success) {
        let balance = balanceOf.output;
        let address = balanceOf.input.target;

        if (BigNumber(balance).toNumber() <= 0) {
          return;
        }

        balances[address] = BigNumber(balances[address] || 0)
          .plus(balance)
          .toFixed();
      }
    });

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: "Erasure",
    token: "NMR",
    category: "derivatives",
    start: 1566518400, // 08/23/2019 @ 12:00am (UTC)
    tvl
  };
