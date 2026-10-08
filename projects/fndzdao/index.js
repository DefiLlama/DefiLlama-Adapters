const { staking } = require('../helper/staking')
const { getCreateAddress } = require('ethers')
const getTrackedAssetsAbi = "address[]:getTrackedAssets"
const dispatcher = '0x07036f5385AE6F4049f7788bD960f9Dd7fecC241'
const deploymentBlock = 18879113

async function getVaults(api) {
  const block = await api.getBlock()
  if (block < deploymentBlock) return []

  // This immutable Dispatcher only CREATEs VaultProxy contracts, starting at
  // nonce 1. Read the nonce at the balance block so historical runs cannot
  // include future vaults. Source: https://sourcify.dev/server/v2/contract/56/0x07036f5385AE6F4049f7788bD960f9Dd7fecC241?fields=sources
  const nonce = await api.provider.getTransactionCount(dispatcher, block)
  if (!Number.isSafeInteger(nonce) || nonce < 1) throw new Error('Invalid FNDZ dispatcher nonce')
  const vaults = Array.from({ length: nonce - 1 }, (_, i) => getCreateAddress({ from: dispatcher, nonce: i + 1 }))
  const deployers = await api.multiCall({
    target: dispatcher,
    abi: 'function getFundDeployerForVaultProxy(address) view returns (address)',
    calls: vaults,
  })
  if (deployers.length !== vaults.length || deployers.some(address => address === '0x0000000000000000000000000000000000000000'))
    throw new Error('Incomplete FNDZ vault discovery')
  return vaults
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
