const { staking } = require('../helper/staking')
const { getCreateAddress } = require('ethers')
const getTrackedAssetsAbi = "address[]:getTrackedAssets"
const dispatcher = '0x07036f5385AE6F4049f7788bD960f9Dd7fecC241'
const deploymentBlock = 18879113
const zero = '0x0000000000000000000000000000000000000000'

async function getVaults(api) {
  const block = await api.getBlock()
  if (block < deploymentBlock) return []

  // the Dispatcher registers every VaultProxy it CREATEs (nonce 1 onward) and never clears it, so registered addresses form a prefix
  const vaults = []
  for (let nonce = 1; ; nonce += 100) {
    const batch = Array.from({ length: 100 }, (_, i) => getCreateAddress({ from: dispatcher, nonce: nonce + i }))
    const deployers = await api.multiCall({
      target: dispatcher,
      abi: 'function getFundDeployerForVaultProxy(address) view returns (address)',
      calls: batch,
    })
    const count = deployers.findIndex(address => address === zero)
    if (count === -1) { vaults.push(...batch); continue }
    if (deployers.slice(count).some(address => address !== zero)) throw new Error('Incomplete FNDZ vault discovery')
    return vaults.concat(batch.slice(0, count))
  }
}

async function tvl(api) {
  const vaults = await getVaults(api)
  if (!vaults.length) return api.getBalances()
  const tokens  = await api.multiCall({  abi: getTrackedAssetsAbi, calls: vaults })
  const ownerTokens = vaults.map((v, i) => [tokens[i], v])
  return api.sumTokens({ ownerTokens, })
}

module.exports = {
  methodology: 'TVL is the ERC-20 custody of tracked assets in all vaults created by the FNDZ Dispatcher on BSC. Vault discovery, tracked assets and balances use the same block. FNDZ held by the staking contract is reported separately as staking.',
  bsc: {
    tvl,
    staking: staking('0x4910638b88c40Ee382CEd72A4056E2f859Bd4658', '0x7754c0584372d29510c019136220f91e25a8f706')
  },
};
