const ADDRESSES = require('../helper/coreAssets.json')

const registryAddresses = [
  '0xa6cf4Bf00feF8866e9F3f61C972bA7C687C6eDbF', // Erasure Agreements
  '0x409EA12E73a10EF166bc063f94Aa9bc952835E93', // Erasure Escrows
  '0x348FA9DcFf507B81C7A1d7981244eA92E8c6Af29' // Erasure Posts
];

const tokenAddresses = [
  '0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671', // NMR
  ADDRESSES.ethereum.DAI // DAI
]

async function tvl(api) {
  const instances = await api.fetchList({ lengthAbi: 'getInstanceCount', itemAbi: 'getInstance', targets: registryAddresses })
  return api.sumTokens({ owners: instances, tokens: tokenAddresses })
}

module.exports = {
  start: '2019-08-23', // 08/23/2019 @ 12:00am (UTC)
  ethereum: { tvl }
};
