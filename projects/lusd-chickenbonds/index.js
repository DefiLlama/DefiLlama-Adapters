const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const getTreasuryAbi = require("./getTreasury.abi.json");

const CHICKEN_BOND_MANAGER_CONTRACT = '0x57619FE9C539f890b19c61812226F9703ce37137';
const LUSD_ADDRESS = '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0';

async function tvl(_, block) {
  const bucketAmounts = (await sdk.api.abi.call({
    target: CHICKEN_BOND_MANAGER_CONTRACT,
    abi: getTreasuryAbi,
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
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the amount of LUSD tokens in the 3 buckets of the LUSD ChickenBonds protocol.',
  start: 15674057,
  ethereum: {
    tvl,
  },
};
