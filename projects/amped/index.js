const { staking } = require('../helper/staking')
const { gmxExports } = require('../helper/gmx')

const phoenixVaultAddress = '0xa6b88069EDC7a0C2F062226743C8985FF72bB2Eb';
const phoenixStakingAddress = '0x3c9586567a429BA0467Bc63FD38ea71bB6B912E0';
const phoenixAmpAddress = '0xca7F14F14d975bEFfEe190Cd3cD232a3a988Ab9C';

const sonicVaultAddress = '0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da';
const sonicStakingAddress = '0xCe0a0e2BbA0F2168DD614b1414CfE707c13aa081';
const sonicAmpAddress = '0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4';

const bscVaultAddress = '0xdcFaaf6f3bb71B270404992853588BE9B7fc89EA';
const bscStakingAddress = '0x9fe50b66fc34cA06BbC684fF13242d61c860F190';
const bscAmpAddress = '0x16DF3d8978d17fE725Dc307aD14FdE3B12E6Da75';

const berachainVaultAddress = '0xc3727b7E7F3FF97A111c92d3eE05529dA7BD2f48';
const berachainStakingAddress = '0xE65668F745F546F061b4fC925A31Cb1F6512c32A';
const berachainAmpAddress = '0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4';

const baseVaultAddress = '0xed33E4767B8d68bd7F64c429Ce4989686426a926';
const baseStakingAddress = '0x9e45B1f3983e5BD6480C39f57F876df0eda8EA74';
const baseAmpAddress = '0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4';

module.exports = {
  start: '2024-06-06',
  lightlink_phoenix: {
    staking: staking(phoenixStakingAddress, phoenixAmpAddress),
    tvl: gmxExports({ vault: phoenixVaultAddress, })
  },
  bsc: {
    staking: staking(bscStakingAddress, bscAmpAddress),
    tvl: gmxExports({ vault: bscVaultAddress, })
  },
  sonic: {
    staking: staking(sonicStakingAddress, sonicAmpAddress),
    tvl: gmxExports({ vault: sonicVaultAddress, })
  },
  berachain: {
    staking: staking(berachainStakingAddress, berachainAmpAddress),
    tvl: gmxExports({ vault: berachainVaultAddress, })
  },
  base: {
    staking: staking(baseStakingAddress, baseAmpAddress),
    tvl: gmxExports({ vault: baseVaultAddress, })
  }
};