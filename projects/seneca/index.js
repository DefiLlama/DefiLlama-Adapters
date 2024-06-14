const { staking } = require('../helper/staking');

const stakingContract = '0x0bD623E8150918b4252a1df407B914250AcE4CC6';
const senToken = '0x154388a4650D63acC823e06Ef9e47C1eDdD3cBb2';

const config = {
  arbitrum: { chambers: ['0x2d99E1116E73110B88C468189aa6AF8Bb4675ec9', '0x4D7b1A1900b74ea4b843a5747740F483152cbA5C', '0x7C160FfE3741a28e754E018DCcBD25dB04B313AC',], lens: '0x5c6cBA80e5FA3c8D9FD53F17d6F5a7A2EDb5fC8C', },
  ethereum: { chambers: ['0xBC83F2711D0749D7454e4A9D53d8594DF0377c05', '0x65c210c59B43EB68112b7a4f75C8393C36491F06'], lens: '0x9cae6d5a09E4860AfCD1DF144250dd02A014DF15', },
}

module.exports = {
  doublecounted: true,
  methodology: 'Counts the TVL of SEN tokens staked in the staking contracts and the total collateral in chambers across Arbitrum and Ethereum.',
};

Object.keys(config).forEach(chain => {
  const { chambers } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:collateral', calls: chambers })
      const bals = await api.multiCall({ abi: 'uint256:totalCollateralShare', calls: chambers })
      api.add(tokens, bals)
      return api.getBalances()
    }
  }
})

module.exports.arbitrum.staking = staking(stakingContract, senToken)