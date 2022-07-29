const abi = require('./abi.json');
const sdk = require('@defillama/sdk');
const { sumTokens } = require('../helper/unwrapLPs');

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

const ethAddress = '0x0000000000000000000000000000000000000000';
const ethReserveAddresses = ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'];
const bancor = '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c'

async function addV3Balance(balances, block) {
  const masterVault = '0x649765821D9f64198c905eC0B2B037a4a52Bc373'
  const networkSettings = '0xeEF417e1D5CC832e619ae18D2F140De2999dD4fB'
  const { output: tokens } = await sdk.api.abi.call({
    target: networkSettings, block, abi: abi.liquidityPools
  })

  tokens.push(bancor)

  const toa = tokens
    .filter(t => !ethReserveAddresses.includes(t.toLowerCase()))
    .map(t => [t, masterVault])

  const { output: balance } = await sdk.api.eth.getBalance({ target: masterVault, block })
  sdk.util.sumSingleBalance(balances, ethAddress, balance)
  return sumTokens(balances, toa, block)
}

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  let balanceCalls = await generateCallsByBlockchain(block);

  // get ETH balances
  let balances = {};

  const ethBalanceCalls = balanceCalls.filter((call) => ethReserveAddresses.includes(call.target.toLowerCase())).map(call => call.params[0])
  ethBalanceCalls.push('0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315')


  const { output: ethBalances } = await sdk.api.eth.getBalances({ targets: ethBalanceCalls, block })
  ethBalances.forEach(bal => sdk.util.sumSingleBalance(balances, ethAddress, bal.balance))

  // get reserve balances
  let result = await sdk.api.abi.multiCall({
    calls: balanceCalls.filter(c => c.target.toLowerCase() !== "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase()),
    abi: 'erc20:balanceOf',
    block
  });

  sdk.util.sumMultiBalanceOf(balances, result);

  return addV3Balance(balances, block)
}

module.exports = {
  start: 1501632000,  // 08/02/2017 @ 12:00am (UTC)
  ethereum: {
    tvl,
  }
};
