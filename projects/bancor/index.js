  const abi = require('./abi.json');
  const sdk = require('@defillama/sdk');
  const BigNumber = require('bignumber.js');

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
    let balanceCalls = await generateCallsByBlockchain(block);

    // get ETH balances
    const ethAddress = '0x0000000000000000000000000000000000000000';
    let balances = {
      [ethAddress]: (await sdk.api.eth.getBalance({target: '0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315', block})).output
    };

    const ethReserveAddresses = ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'];
    const ethBalanceCalls = balanceCalls.filter((call) => ethReserveAddresses.includes(call.target.toLowerCase()));

    await (
      Promise.all(ethBalanceCalls.map(async (call) => {
        const ethBalance = (await sdk.api.eth.getBalance({target: call.params[0], block})).output;
        balances[ethAddress] = BigNumber(balances[ethAddress]).plus(ethBalance).toFixed();
      }))
    );

    // get reserve balances
    let result = await sdk.api.abi.multiCall({
      calls: balanceCalls.filter(c=>c.target !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"),
      abi: 'erc20:balanceOf',
      block
    });

    sdk.util.sumMultiBalanceOf(balances, result);

    return balances;
  }

  module.exports = {
    start: 1501632000,  // 08/02/2017 @ 12:00am (UTC)
    ethereum: {
      tvl,
    }
  };
