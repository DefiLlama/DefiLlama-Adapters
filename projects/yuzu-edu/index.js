const ADDRESSES = require('../helper/coreAssets.json');

async function tvl(api) {
  const totalSupply = await api.call({  abi: 'erc20:totalSupply', target: ADDRESSES.occ.WEDU })
  api.add(ADDRESSES.occ.WEDU, totalSupply)
}

module.exports = {
  methodology: 'checks wrapped edu in circulation',
  hallmarks: [[1737463560, "Project Announcement"]],
  occ: { tvl },
}

