const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const contracts = {
    "chains": [
      "ethereum",
      "bsc",
      "polygon",
      "fantom",
      "step",
      "celo"
    ],
    "stakingContractEth": "0xd07e86f68C7B9f9B215A3ca3E79E74Bf94D6A847",
    "stakingTokenEth": "0x0f51bb10119727a7e5eA3538074fb341F56B09Ad"
  };

const chainIds = {
  "ethereum": "1",
  "bsc": "56",
  "polygon": "137",
  "fantom": "250",
  "step": "1234",
  "celo": "42220"
}

let vestingData, stakingData

async function getVestingData() {
  if (!vestingData)
    vestingData = getConfig('daomaker/vesting', 'https://api.daomaker.com/get-all-vesting-contracts')
  return vestingData
}

function filterDuplicates(toa) {
  const data = toa.map(i => i.map(i => i.toLowerCase()).join('-'))
  return [... new Set(data)].map(i => i.split('-'))
}

async function getStakingData() {
  if (!stakingData)
    stakingData = getConfig('daomaker/staking', 'https://api.daomaker.com/get-all-farms')
  return stakingData
}

function vesting(chain) {
  return async (timestamp, _, { [chain]: block }) => {
    const toa = []
    const vestingContracts = await getVestingData();
    vestingContracts.filter(i => i.chain_id.toString() === chainIds[chain])
      .forEach(i => toa.push([i.token_address, i.vesting_smart_contract_address]))
    return sumTokens2({ chain, block, tokensAndOwners: filterDuplicates(toa) })
  };
}
function staking(chain) {
  return async (timestamp, _, { [chain]: block }) => {
    const toa = []
    const contracts = await getStakingData();
    contracts.forEach(({ farms }) => {
      farms.filter(i => i.chain_id.toString() === chainIds[chain])
        .forEach(i => toa.push([i.staking_address, i.farm_address]))
    })
    return sumTokens2({ chain, block, tokensAndOwners: filterDuplicates(toa) })
  };
}

const chainTVLObject = contracts.chains.reduce(
  (agg, chain) => ({
    ...agg, [chain]: {
      tvl: () => ({}),
      vesting: vesting(chain),
      staking: staking(chain),
    }
  }), {}
);

chainTVLObject.ethereum.staking = sdk.util.sumChainTvls([
  chainTVLObject.ethereum.staking,
  stakings(
    [contracts.stakingContractEth],
    contracts.stakingTokenEth
  )
]);

module.exports = {
  ...chainTVLObject
};
