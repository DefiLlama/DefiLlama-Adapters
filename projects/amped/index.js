const {staking} = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

const phoenixVaultAddress = '0xa6b88069EDC7a0C2F062226743C8985FF72bB2Eb';
const phoenixStakingAddress = '0x3c9586567a429BA0467Bc63FD38ea71bB6B912E0';
const phoenixAmpAddress = '0xca7F14F14d975bEFfEe190Cd3cD232a3a988Ab9C';

module.exports = {
  start: 1717674114,
  lightlink_phoenix: {
    staking: staking(phoenixStakingAddress, phoenixAmpAddress),
    tvl: gmxExports({ vault: phoenixVaultAddress, })
  },
};
