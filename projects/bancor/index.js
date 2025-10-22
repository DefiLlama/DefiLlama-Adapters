const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const abis = {
  "abiContractRegistryAddressOf": "function addressOf(bytes32 _contractName) view returns (address)",
  "abiConverterRegistryGetPools": "address[]:getLiquidityPools",
  "abiRegistryGetConvertersBySmartTokens": "function getConvertersBySmartTokens(address[] _smartTokens) view returns (address[])",
  "abiConverterConnectorTokens": "function connectorTokens(uint256) view returns (address)",
  "liquidityPools": "address[]:liquidityPools"
}

const registryAddress = '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4';
const converterRegistryHex = '0x42616e636f72436f6e7665727465725265676973747279000000000000000000';
const oldConverter = '0xf6E2D7F616B67E46D708e4410746E9AAb3a4C518'

const tvl = async (api) => {
  const block = await api.getBlock()
  const isOldBlock = block && block < 9195218

  const converterRegistryAddress = isOldBlock
    ? oldConverter
    : await api.call({ abi: abis.abiContractRegistryAddressOf, target: registryAddress, params: [converterRegistryHex] });

  const poolAnchorAddresses = await api.call({ abi: abis.abiConverterRegistryGetPools, target: converterRegistryAddress });
  const converterAddresses = await api.call({ abi: abis.abiRegistryGetConvertersBySmartTokens, target: converterRegistryAddress, params: [poolAnchorAddresses] });
  const tokens = await api.fetchList({ itemAbi: abis.abiConverterConnectorTokens, itemCount: 2, calls: converterAddresses, groupedByInput: true })
  
  const tokenList = []
  const ownerList = []

  tokens.forEach((toks, i) => {
    toks.concat(ADDRESSES.null).forEach(token => {
      tokenList.push(token)
      ownerList.push(converterAddresses[i])
    })
  })

  return sumTokens2({ api, tokensAndOwners2: [tokenList, ownerList] })
}

module.exports = {
  start: '2017-08-02',  // 08/02/2017 @ 12:00am (UTC)
  ethereum : { tvl },
  hallmarks: [
    [1588114800, "V2.0 Launch"], // 29/04/2020 @ 12:00am (UTC)
    [1602457200, "V2.1 Launch"]  // 12/10/2020 @ 12:00am (UTC)
  ],
}