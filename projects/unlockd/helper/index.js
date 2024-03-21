const abi = require("./abi/abi");
const address = require("./addresses");
const { sumTokens2 } = require("../../helper/unwrapLPs")

async function tvl(api) {
  const tokens = await api.call({ target: address.ethereum.UNFTRegistry, abi: abi.UNFTRegistry.getUNFTAssetList, })
  const owners = (await api.multiCall({  abi: 'function getUNFTAddresses(address) view returns (address proxy, address impl)', calls: tokens, target: address.ethereum.UNFTRegistry,})).map(i => i.proxy)

  const reservesData = await api.call({
    target: address.ethereum.UiPoolDataProvider,
    params: [address.ethereum.LendPoolAddressProvider],
    abi: abi.UiPoolDataProvider.getSimpleReservesData
  })

  reservesData.forEach(({ underlyingAsset, availableLiquidity }) => api.add(underlyingAsset, availableLiquidity))

  return sumTokens2({ api, tokensAndOwners2: [tokens, owners] });
}

async function borrowed(api) {
  const reservesData = await api.call({
    target: address.ethereum.UiPoolDataProvider,
    params: [address.ethereum.LendPoolAddressProvider],
    abi: abi.UiPoolDataProvider.getSimpleReservesData
  })

  reservesData.forEach(({ underlyingAsset, totalVariableDebt }) => api.add(underlyingAsset, totalVariableDebt))
}

module.exports = {
  tvl,
  borrowed,
};


