const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const abi = "function totalAssets() view returns (uint256)"
  const kETHStrategyAddress = "0xa060a5F83Db8bf08b45Cf56Db370c9383b7B895C";
  const dETHVaultAddress = "0x4c7aF9BdDac5bD3bee9cd2Aa2FeEeeE7610f5a6B";

  let kETHTvl = await api.call({ abi: abi, target: kETHStrategyAddress })
  let dETHTvl = await api.call({ abi: abi, target: dETHVaultAddress })
  api.add(ADDRESSES.null, kETHTvl)
  api.add(ADDRESSES.null, dETHTvl)
  return api.getBalances()
}

module.exports = {
  ethereum: {
    tvl
  }
};