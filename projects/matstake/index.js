const ADDRESSES = require('../helper/coreAssets.json')
const MAT = ADDRESSES.matchain.MAT
const { sumTokens2 } = require('../helper/unwrapLPs')
const POOLS = [
  '0xa1843e71d1390d4A31469A53EeEfBB2f9AAe34ed', // LiquidStakingPool (also holds MAT)
  '0xff5eb1345aa5d4c948c227742fcd32157539e480',
  '0xfa38f584f561642ff0d1ab67b5a175798668a047',
  '0xf9ff433f14f237ce6643257ca4cd5aec355eaee7',
  '0xeef37e218087bca2f4c3c6c4c50f3d3b51b2eb4d',
  '0xdd1904dcf7e0b6dff60bd9729f626b076999e18f',
  '0xdb604be88482ce061fbc2595e619f967de1a7502',
  '0xd899cd3cafb1c9f6d585c36649592956d3df5ef9',
  '0xc3258af62e46b502700c34ed7c3128f99f0fc532',
  '0xc021a95e3ad7d4e06745c4a12438a960c33859d7',
  '0xb4175a66e28f2c348959872b28af0d12f891201f',
  '0xa3be9646116f834d0f9f1a035fdad6862b5f0a2a',
  '0x9c4c30d5cd29c6d24cf1a712d93b756cbf5071ba',
  '0x96b5f62604729ed5b7219f1b3f15a8359e0a86fb',
  '0x8aa82b86056af2dd5cdaab45eefe500c84d0af82',
  '0x739110f0233b8598957af1321920787c13142910',
  '0x53f91b6ae02c8cdbc22565f7f7a158add6f1de6e',
  '0x4a47d64b074d730868623d89ec633d16adf53212',
  '0x443d8318224c59c31987ea310033d0dc47a10d88',
  '0x256b02b26c67029b2881ab5d493cf8e5068d5fcc',
  '0x0de1a88dcf7fd12c54d9ac0807c990f26bd1c121',
  '0x0b0381a2c4c3a537c614afe71334c9f387718922',
]

async function staking(api) {
  return sumTokens2({ api, owners: POOLS, tokens: [MAT] })
}

module.exports = {
  methodology: 'Sums the MAT token balance held by the LiquidStakingPool contract and all staking pools to represent total user deposits.',
  timetravel: true,
  matchain: {
    tvl: () => ({}),
    staking,
  },
} 