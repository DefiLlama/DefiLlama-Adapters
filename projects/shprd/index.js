const protocolConfig = {
  factories: {
    ethereum: { address: '0xf14c4b935054b8d1017ad96c9a265eb7f8ecf13c' },
    arbitrum: { address: '0xf0ee0b31aae29f0bea8ff806c101377fc92e4ffa' },
  }
}

async function tvl(ts, block, _, { api }) {
    // 1. get all vaults deployed on chain
    const factoryAddress = protocolConfig.factories[api.chain].address
    const factoryState = await api.call({
      abi: "function getFactoryState() view returns (address[], address, address, address, address, address)",
      target: factoryAddress,
    });
    const vaultAddresses = factoryState[0]

    // 2. get all tradable erc20s for these same vaults
    const erc20Addresses = await api.call({
      abi: "function getWhitelistedTokens() view returns (address[])",
      target: factoryAddress,
    });


    // for each vault
    for (let vIndex = 0; vIndex < vaultAddresses.length; vIndex++) {
      // get erc20 balances
      const multiCallResults = await api.multiCall({
        calls: erc20Addresses.map(erc20Address => ({
          target: erc20Address,
          params: [vaultAddresses[vIndex]]
        })),
        abi: 'erc20:balanceOf',
        withMetadata: true,
      });

      // then iterate over each erc20
      for (let eIndex = 0; eIndex < multiCallResults.length; eIndex++) {
        // prepare add args
        const erc20Address = multiCallResults[eIndex].input.target
        const balance = Number(multiCallResults[eIndex].output)

        // add token with respective balance
        api.add(erc20Address, balance)
      }
    }
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