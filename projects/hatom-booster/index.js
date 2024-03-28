const { call } = require('../helper/chain/elrond')

const boosterContractAddress = 'erd1qqqqqqqqqqqqqpgqw4dsh8j9xafw45uwr2f6a48ajvcqey8s78sstvn7xd'
const htm = 'HTM-f51d55'

const staking = async (api) => {
   const totalStaked = await call({
      target: boosterContractAddress,
      abi: 'getTotalStake',
      responseTypes: ['number']
   })
   api.addTokens([htm], [totalStaked.toString()])
};

module.exports = {
   timetravel: false,
   elrond: {
      tvl: () => ({}),
      staking
   },
};
