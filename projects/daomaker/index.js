const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { get } = require('../helper/http')
const contracts = require("./contracts.json");

const chainIds = {
  "ethereum": "1",
  "bsc": "56",
  "polygon": "137",
  "fantom": "250",
  "celo": "42220"
}

let vestingData, stakingData

async function getVestingData() {
  if (!vestingData)
    vestingData = get('https://api.daomaker.com/get-all-vesting-contracts')
  return vestingData
}

function filterDuplicates(toa) {
  const data = toa.map(i => i.map(i => i.toLowerCase()).join('-'))
  return [... new Set(data)].map(i => i.split('-'))
}

async function getStakingData() {
  if (!stakingData)
    stakingData = get('https://api.daomaker.com/get-all-farms')
  return stakingData
}

function vesting(chain) {
  return async (timestamp, _, { [chain]: block }) => {
    const toa = []
    const vestingContracts = await getVestingData();
    vestingContracts.filter(i => i.chain_name === chain)
      .forEach(i => toa.push([i.token_address, i.vesting_smart_contract_address]))
    return sumTokens2({ chain, block, tokensAndOwners: filterDuplicates(toa) })
  };
};
function staking(chain) {
  return async (timestamp, _, { [chain]: block }) => {
    const toa = []
    const contracts = await getStakingData();
    contracts.forEach(({ farms }) => {
      farms.filter(i => i.chain_id === chainIds[chain])
        .forEach(i => toa.push([i.staking_address, i.farm_address]))
    })
    return sumTokens2({ chain, block, tokensAndOwners: filterDuplicates(toa) })
  };
};

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