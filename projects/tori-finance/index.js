const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const assets = await api.call({ target: '0xd0580192E98eA6CEB9c7b6191Ed2E27560911697', abi: 'uint256:totalSupply' });
  api.add('0xd0580192E98eA6CEB9c7b6191Ed2E27560911697', assets)
}

module.exports = {
  methodology: 'Supply of trUSD',
  ethereum: { tvl }
}