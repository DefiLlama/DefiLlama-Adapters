const { staking } = require('../helper/staking')

const EARNING_CONTRACT = '0x7016db90c1f8b87ea4d18b7e53fb7c42999bc995';
const TURTLE_TOKEN = '0x8C9E2bEf2962CE302ef578113eebEc62920B7e57';

module.exports = {
  methodology: 'Staking includes tokens locked in staking contract. TVL is empty.',
  cronos: {
    tvl: () => ({}), // No base TVL since only staking
    staking: staking(EARNING_CONTRACT, TURTLE_TOKEN),
  }
};