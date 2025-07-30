const { gmxExports } = require('../helper/gmx')
const { staking } = require('../helper/staking')

const phoenixVaultAddress = '0xa6b88069EDC7a0C2F062226743C8985FF72bB2Eb';
const phoenixStakingAddress = '0x3c9586567a429BA0467Bc63FD38ea71bB6B912E0';
const phoenixAmpedAddress = '0xca7F14F14d975bEFfEe190Cd3cD232a3a988Ab9C';

const sonicVaultAddress = '0x5B8caae7cC6Ea61fb96Fd251C4Bc13e48749C7Da';
const sonicStakingAddress = '0xE8b485031343D7F38d59C92fA25805A4e72C6a4a';
const sonicAmpedAddress = '0x4Cae73a23078e7A94D1e828Fa3bABa5080c04FcA';

const bscVaultAddress = '0xdcFaaf6f3bb71B270404992853588BE9B7fc89EA';
const bscStakingAddress = '0x9fe50b66fc34cA06BbC684fF13242d61c860F190';
const bscAmpedAddress = '0x16DF3d8978d17fE725Dc307aD14FdE3B12E6Da75';

const berachainVaultAddress = '0xc3727b7E7F3FF97A111c92d3eE05529dA7BD2f48';
const berachainStakingAddress = '0xE65668F745F546F061b4fC925A31Cb1F6512c32A';
const berachainAmpedAddress = '0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4';

const baseVaultAddress = '0xed33E4767B8d68bd7F64c429Ce4989686426a926';
const baseStakingAddress = '0x9e45B1f3983e5BD6480C39f57F876df0eda8EA74';
const baseAmpedAddress = '0xAc611438AE5F3953DeDB47c2ea8d6650D601C1B4';

const superseedVaultAddress = '0x7f27Ce4B02b51Ea3a433eD130259F8A173F7c6C7';
const superseedStakingAddress = '0x5ac57B6034590E53fC214Dd31E30b7C7D9D627C9';
const superseedAmpedAddress = '0x9951bC662dFA91DE9a893d68055B6f086669b025';

module.exports = {
  start: '2024-06-06',
  lightlink_phoenix: {
    tvl: gmxExports({ vault: phoenixVaultAddress }),
    staking: staking(phoenixStakingAddress, phoenixAmpedAddress)
  },
  bsc: {
    tvl: gmxExports({ vault: bscVaultAddress }),
    staking: staking(bscStakingAddress, bscAmpedAddress)
  },
  sonic: {
    tvl: gmxExports({ vault: sonicVaultAddress }),
    staking: staking(sonicStakingAddress, sonicAmpedAddress)
  },
  berachain: {
    tvl: gmxExports({ vault: berachainVaultAddress }),
    staking: staking(berachainStakingAddress, berachainAmpedAddress)
  },
  base: {
    tvl: gmxExports({ vault: baseVaultAddress }),
    staking: staking(baseStakingAddress, baseAmpedAddress)
  },
  sseed: {
    tvl: gmxExports({ vault: superseedVaultAddress }),
    staking: staking(superseedStakingAddress, superseedAmpedAddress)
  }
};