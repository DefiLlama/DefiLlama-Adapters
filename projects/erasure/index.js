const ADDRESSES = require('../helper/coreAssets.json')
/*==================================================
  Modules
  ==================================================*/

  const sdk = require("@defillama/sdk");

  const BigNumber = require("bignumber.js");

  const abi = require('./abi.json');

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
    ADDRESSES.ethereum.DAI // DAI
  ]

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    let balances = {};

    // instances count for each registry
    const instanceCounts = (
      await sdk.api.abi.multiCall({
        calls: registryAddresses.map((registryAddress) => {
          return {
            target: registryAddress
          }
        }),
        abi: abi.getInstanceCount
      })
    ).output;

    let paginatedInstancesCalls = [];

    instanceCounts.forEach((instanceCount) => {
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

    paginatedInstances.forEach((instances) => {
      instanceAddresses = [
        ...instanceAddresses,
        ...instances.output
      ]
    });

    instanceAddresses = [... new Set(instanceAddresses)]

    let balanceOfCalls = [];

    instanceAddresses.forEach((instanceAddress) => {
      tokenAddresses.forEach((tokenAddress) => {
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
    balanceOfResults.output.forEach(balanceOf => {
        let balance = balanceOf.output;
        let address = balanceOf.input.target;

        balances[address] = BigNumber(balances[address] || 0)
          .plus(balance)
          .toFixed();
    });

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    start: 1566518400, // 08/23/2019 @ 12:00am (UTC)
    ethereum: { tvl }
  };
