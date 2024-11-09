const protocolConfig = {
  factories: {
    ethereum: { address: '0xf14c4b935054b8d1017ad96c9a265eb7f8ecf13c' },
    arbitrum: { address: '0xf0ee0b31aae29f0bea8ff806c101377fc92e4ffa' },
  }
}

async function tvl(api) {
  // 1. get all vaults deployed on chain
  const factoryAddress = protocolConfig.factories[api.chain].address
  const factoryState = await api.call({
    abi: "function getFactoryState() view returns (address[], address, address, address, address, address)",
    target: factoryAddress,
  });
  const vaultAddresses = factoryState[0]

  // 2. get all tradable erc20s for these same vaults
  const tokens = await api.call({ abi: "address[]:getWhitelistedTokens", target: factoryAddress, });
  return api.sumTokens({ owners: vaultAddresses, tokens, })
}


module.exports = {
  start: 1688162400,
  hallmarks: [
    [1695396647, "Fees distribution #1"],
    [1705582439, "Fees distribution #2"],
  ],
  methodology: `TVL is the total value of erc20s managed by SHPRD vaults`
};

Object.keys(protocolConfig.factories).forEach(chain => {
  module.exports[chain] = { tvl }
})