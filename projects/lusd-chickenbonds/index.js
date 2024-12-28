const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");

const CHICKEN_BOND_MANAGER_CONTRACT = '0x57619FE9C539f890b19c61812226F9703ce37137';
const LUSD_ADDRESS = ADDRESSES.ethereum.LUSD;

async function tvl(_, block) {
  const bucketAmounts = (await sdk.api.abi.call({
    target: CHICKEN_BOND_MANAGER_CONTRACT,
    abi: 'function getTreasury() view returns (uint256 _pendingLUSD, uint256 _totalAcquiredLUSD, uint256 _permanentLUSD)',
    chain: "ethereum",
    block,
  })).output;

  return {
    [LUSD_ADDRESS]: new BigNumber(bucketAmounts._pendingLUSD)
      .plus(new BigNumber(bucketAmounts._totalAcquiredLUSD))
      .plus(new BigNumber(bucketAmounts._permanentLUSD))
      .toFixed(0)
  };
}

module.exports = {
      methodology: 'counts the amount of LUSD tokens in the 3 buckets of the LUSD ChickenBonds protocol.',
  ethereum: {
    tvl,
  },
};
