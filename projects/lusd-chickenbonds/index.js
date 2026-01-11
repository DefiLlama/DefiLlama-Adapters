const ADDRESSES = require('../helper/coreAssets.json')

const CHICKEN_BOND_MANAGER_CONTRACT = '0x57619FE9C539f890b19c61812226F9703ce37137';
const LUSD_ADDRESS = ADDRESSES.ethereum.LUSD;

async function tvl(api) {
  const bucketAmounts = await api.call({
    target: CHICKEN_BOND_MANAGER_CONTRACT,
    abi: 'function getTreasury() view returns (uint256 _pendingLUSD, uint256 _totalAcquiredLUSD, uint256 _permanentLUSD)',
  })
  api.add(LUSD_ADDRESS, [bucketAmounts._pendingLUSD, bucketAmounts._totalAcquiredLUSD, bucketAmounts._permanentLUSD])
}

module.exports = {
      methodology: 'counts the amount of LUSD tokens in the 3 buckets of the LUSD ChickenBonds protocol.',
  ethereum: {
    tvl,
  },
};
