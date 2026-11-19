const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
  "coreVault": "address:coreVault",
  "gVault": "address:gVault",
  "getValidators": "uint64[]:getValidators",
  "getDelegator": "function getDelegator(uint64 validatorId, address delegator) returns (uint256 stake, uint256 accRewardPerToken, uint256 unclaimedRewards, uint256 deltaStake, uint256 nextDeltaStake, uint64 deltaEpoch, uint64 nextDeltaEpoch)"
}

// Contract addresses on Monad testnet
const MAGMA_ADDRESS = '0x8498312A6B3CbD158bf0c93AbdCF29E6e4F55081';
const STAKING_PRECOMPILE = ADDRESSES.findora.FRA;

async function tvl(api) {
  // Get CoreVault and GVault addresses from Magma
  const coreVaultAddress = await api.call({ target: MAGMA_ADDRESS, abi: abi.coreVault })
  const gVaultAddress = await api.call({ target: MAGMA_ADDRESS, abi: abi.gVault })
  const vaults = [coreVaultAddress, gVaultAddress];
  const validators = (await api.multiCall({ calls: vaults, abi: abi.getValidators })).map((v, i) => {
    return v.map(vid => ({ params: [vid, vaults[i]]}))
  }).flat()

  const stakingInfo = await api.multiCall({  abi: abi.getDelegator, calls: validators, target: STAKING_PRECOMPILE})
  stakingInfo.forEach((i) => {
    api.addGasToken([i.stake, i.unclaimedRewards, i.deltaStake, i.nextDeltaStake])
  })
}

module.exports = {
  methodology: 'Calculates TVL by summing all validator delegations (active stake + pending stake + next pending stake + unclaimed rewards) from both CoreVault and GVault through the Monad staking precompile',
  monad: {
    tvl,
  },
};

