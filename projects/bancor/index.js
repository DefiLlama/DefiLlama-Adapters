/*==================================================
  Modules
  ==================================================*/

  const abi = require('./abi.json');
  const sdk = require('@defillama/sdk');
  const axios = require('axios');
  const _ = require('underscore');
  const moment = require('moment');
  const BigNumber = require('bignumber.js');

  /*==================================================
  Helper Functions
  ==================================================*/

  async function generateCallsByAPI(timestamp) {
    let tokenConverters = [];

    let moreData = true;
    let index = 0;
    let pageFetchCount = 300;

    while(moreData) {
      let converters = await axios.get('https://api.bancor.network/0.1/converters', {
        params: {
          skip: index,
          limit: pageFetchCount
        }
      });

      converters = converters.data.data.page;

      index += pageFetchCount;

      tokenConverters = [
        ...tokenConverters,
        ...converters
      ];

      if(converters.length !== pageFetchCount) {
        moreData = false;
      }
    }

    tokenConverters = _.filter(tokenConverters, (converter) => {
      let hasLength = converter.details.length > 0;
      let isEthereum = converter.details[0].blockchain.type === 'ethereum';
      let createdTimestamp = moment(converter.createdAt).utcOffset(0).unix();
      let existsAtTimestamp = createdTimestamp <= timestamp;

      return hasLength && isEthereum && existsAtTimestamp;
    });

    let calls = [];

    _.each(tokenConverters, (converter) => {
      let details = converter.details[0];
      let reserves = details.reserves;

      let owners = _.map(converter.converters, (converter) => {
        return converter.blockchainId;
      });

      _.each(owners, (owner) => {
        if (owner === undefined) {
          return;
        }

        _.each(reserves, (reserve) => {
          let address = reserve.blockchainId;

          calls.push({
            target: address,
            params: owner
          })
        })
      });
    });

    return calls;
  }

  async function generateCallsByBlockchain(block) {
    const registryAddress = '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4';
    const converterRegistryHex = '0x42616e636f72436f6e7665727465725265676973747279000000000000000000';

    let result;
    let converterRegistryAddress;

    if (block < 9195218) {
        converterRegistryAddress = '0xf6E2D7F616B67E46D708e4410746E9AAb3a4C518';
    }
    else {
        // get converter registry address
        result = await sdk.api.abi.call({
        target: registryAddress,
        abi: abi['abiContractRegistryAddressOf'],
        params: [converterRegistryHex],
        block
        });

        converterRegistryAddress = result.output;
    }

    // get pool anchor addresses
    result = await sdk.api.abi.call({
      target: converterRegistryAddress,
      abi: abi['abiConverterRegistryGetPools'],
      block
    });

    // get converter addresses
    result = await sdk.api.abi.call({
      target: converterRegistryAddress,
      abi: abi['abiRegistryGetConvertersBySmartTokens'],
      params: [result.output],
      block
    });

    // get reserve token addresses (currently limited to 2)
    const converterAddresses = result.output;
    const reserveTokenCalls = [];
    for (let i = 0; i < converterAddresses.length; i++) {
      reserveTokenCalls.push({
        target: converterAddresses[i],
        params: [0]
      });
      reserveTokenCalls.push({
        target: converterAddresses[i],
        params: [1]
      });
    }

    result = await sdk.api.abi.multiCall({
      calls: reserveTokenCalls,
      abi: abi['abiConverterConnectorTokens'],
      block
    });

    // create reserve balance calls
    const balanceCalls = [];
    for (let i = 0; i < result.output.length; i++) {
      const item = result.output[i];
      balanceCalls.push({
        target: item.output,
        params: [item.input.target]
      });
    }

    return balanceCalls;
  }

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    let balanceCalls;
    if (timestamp < 1577836800) {
      balanceCalls = await generateCallsByAPI(timestamp);
    }
    else {
      balanceCalls = await generateCallsByBlockchain(block);
    }

    // get ETH balances
    const ethAddress = '0x0000000000000000000000000000000000000000';
    let balances = {
      [ethAddress]: (await sdk.api.eth.getBalance({target: '0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315', block})).output
    };

    const ethReserveAddresses = ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', '0xc0829421c1d260bd3cb3e0f06cfe2d52db2ce315'];
    const ethBalanceCalls = balanceCalls.filter((call) => ethReserveAddresses.includes(call.target.toLowerCase()));

    await (
      Promise.all(ethBalanceCalls.map(async (call) => {
        const ethBalance = (await sdk.api.eth.getBalance({target: call.params[0], block})).output;
        balances[ethAddress] = BigNumber(balances[ethAddress]).plus(ethBalance).toFixed();
      }))
    );

    // get reserve balances
    result = await sdk.api.abi.multiCall({
      calls: balanceCalls,
      abi: 'erc20:balanceOf',
      block
    });

    // filtering out bad balances (hacky)
    result.output = result.output.filter((item) => item.success && item.output.length < 60);

    sdk.util.sumMultiBalanceOf(balances, result);

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    name: 'Bancor',
    token: 'BNT',
    category: 'dexes',
    start: 1501632000,  // 08/02/2017 @ 12:00am (UTC)
    tvl,
  };
