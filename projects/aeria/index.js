const { nullAddress } = require("../helper/tokenMapping");

const FACTORY = "0x649b80892ef773bd64cc3c663950dea3a604f660";

async function tvl(api) {
  let vaults = await api.fetchList({ lengthAbi: 'uint256:vaultCount', itemAbi: 'function vaults(uint256) view returns (address)', target: FACTORY, startFromOne: true, })
  vaults = vaults.filter(i => i !== nullAddress)
  const isPaused = await api.multiCall({ abi: 'bool:paused', calls: vaults })
  vaults = vaults.filter((_, i) => !isPaused[i])
  const tokens = await api.multiCall({ abi: 'address:depositToken', calls: vaults })

  const last_epochs = await api.multiCall({ abi: 'uint:currentEpochNumber', calls: vaults })
  const epochs = await api.multiCall({
    abi: 'function epochs(uint) public view returns ( (uint8, uint256, uint256, uint256, uint256, uint256, uint256, uint256) )',
    calls: vaults.map((vault, index) => { return { target: vault, params: [last_epochs[index] - 1 || 1] } })
  })

  epochs.forEach((epoch, index) => {
    api.add(tokens[index], parseInt(epoch[4]) || parseInt(epoch[2]))
  })
  return api.getBalances()
}

module.exports = {
  doublecouted: true,
  base: {
    tvl,
  },
}
