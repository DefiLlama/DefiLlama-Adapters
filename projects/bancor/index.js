const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');
const abi = require('./abi.json');

async function generateCallsByBlockchain(api) {
  const block = api.block
  const registryAddress = '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4';
  const converterRegistryHex = '0x42616e636f72436f6e7665727465725265676973747279000000000000000000';

  let converterRegistryAddress;

  if (block && block < 9195218) {
    converterRegistryAddress = '0xf6E2D7F616B67E46D708e4410746E9AAb3a4C518';
  }
  else {
    // get converter registry address
    converterRegistryAddress = await api.call({ abi: abi.abiContractRegistryAddressOf, target: registryAddress, params: [converterRegistryHex] });
  }

  // get pool anchor addresses
  const poolAnchorAddresses = await api.call({ abi: abi.abiConverterRegistryGetPools, target: converterRegistryAddress });
  const converterAddresses = await api.call({ abi: abi.abiRegistryGetConvertersBySmartTokens, target: converterRegistryAddress, params: [poolAnchorAddresses] });
  const reserveTokenCalls = [];
  const owners = [];
  for (let i = 0; i < converterAddresses.length; i++) {
    reserveTokenCalls.push({
      target: converterAddresses[i],
      params: [0]
    });
    reserveTokenCalls.push({
      target: converterAddresses[i],
      params: [1]
    });
    owners.push(converterAddresses[i]);
    owners.push(converterAddresses[i]);
  }

  const tokens = await api.multiCall({ calls: reserveTokenCalls, abi: abi['abiConverterConnectorTokens'], });
  tokens.push(ADDRESSES.null);
  owners.push('0xc0829421C1d260BD3cB3E0F06cfE2D52db2cE315');
  return sumTokens2({ api, tokensAndOwners2: [tokens, owners] })
}

module.exports = {
  start: 1501632000,  // 08/02/2017 @ 12:00am (UTC)
  ethereum: {
    tvl: generateCallsByBlockchain,
  },
  hallmarks: [
    [1588114800, "V2.0 Launch"], // 29/04/2020 @ 12:00am (UTC)
    [1602457200, "V2.1 Launch"]  // 12/10/2020 @ 12:00am (UTC)
  ],
};
