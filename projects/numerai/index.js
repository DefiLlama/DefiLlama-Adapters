const ADDRESSES = require('../helper/coreAssets.json')

const registryAddresses = [
  '0xe44c35ec2896983accce2a38dc1668793e85956d', // Tournament 8
  '0xc1f46adf341145369eee9fbe0d84fa1cb0c24706', // Tournament 12
];

const tokenAddresses = [
  '0x1776e1F26f98b1A5dF9cD347953a26dd3Cb46671', // NMR
]

async function tvl(api) {
  const instances = await api.fetchList({ lengthAbi: 'getInstanceCount', itemAbi: 'getInstance', targets: registryAddresses })
  return api.sumTokens({ owners: instances, tokens: tokenAddresses })
}

module.exports = {
  start: '2019-08-23', // 08/23/2019 @ 12:00am (UTC)
  ethereum: { tvl }
};
