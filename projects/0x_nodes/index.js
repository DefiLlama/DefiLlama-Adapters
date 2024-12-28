const { staking } = require('../helper/staking')

const CONFIG = {
  ethereum: {
    bios_token: '0xAACa86B876ca011844b5798ECA7a67591A9743C8',
    kernel_addr: '0xcfcff4eb4799cda732e5b27c3a36a9ce82dbabe0'
  },
  bsc: {
    bios_token: '0xcf87d3d50a98a7832f5cfdf99ae1b88c7cfba4a7',
    kernel_addr: '0x37c12de5367fa61ad05e2bf2d032d7ce5dd31793'
  },
  polygon: {
    bios_token: '0xe20d2df5041f8ed06976846470f727295cdd4d23',
    kernel_addr: '0x267720b5d8dcbdb847fc333ccc68cb284648b816'
  },
  fantom: {
    bios_token: '0x75e0eb8e6d92ab832bb11e46c041d06a89ac5f0d',
    kernel_addr: '0x9db0e84ea53c5a3c000a721bb4295a6053b3de78'
  },
  avax: {
    bios_token: '0xd7783a275e53fc6746dedfbad4a06059937502a4',
    kernel_addr: '0x479ea3715682e6255234e788875bdbded6faae41'
  },
  metis: {
    bios_token: '0x3405a1bd46b85c5c029483fbecf2f3e611026e45',
    kernel_addr: '0xa1DA47F6563e7B17075FcA61DeDC4622aE2F3912'
  },
}

function stakingTvl(chain) {
      const { [chain]:{ bios_token }} = CONFIG
      const { [chain]:{ kernel_addr }} = CONFIG
      return staking(kernel_addr, bios_token)
}

function chainExports(chains){
  const chainTvls = chains.reduce((obj, chain) => ({
    ...obj,
    [chain]: {
      tvl: () => ({}),
      staking: stakingTvl(chain)
    }
  }), {})
  return chainTvls
}
const tvlExports = chainExports(['ethereum', 'bsc', 'polygon', 'fantom', 'metis', 'avax'])
module.exports = {
  hallmarks: [
        [1659527340, "Protocol declared insolvent"],
    ],
  methodology: ` Counts the number of wrapped native tokens in all yield strategies across all the chains the protocol is deployed on
  + staking counts the number of BIOS tokens staked in the kernels across all the chains (PFA: Protocol Fee Accruals by staking assets)`,
  start: '2021-10-01', // Friday 1. October 2021 00:00:00 GMT
  ...tvlExports,
  deadFrom: 1659527340,
}

