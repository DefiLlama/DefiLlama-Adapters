const ADDRESSES = require('./helper/coreAssets.json')

const TROVE_MANAGER_BEACON_PROXY_ADDRESS = '0x0598Ef47508Ec11a503670Ac3B642AAE8EAEdEFA';

async function tvl(api, block) {
  const wbtcBalance = await api.call({
    chain: 'bevm',
    block,
    abi: "erc20:balanceOf",
    target: ADDRESSES.bevm.WBTC,
    params: [TROVE_MANAGER_BEACON_PROXY_ADDRESS],
  });

  const assets = {
    [`bevm:${ADDRESSES.bevm.WBTC}`]: wbtcBalance,
  }

  return assets;
}

module.exports = {
  bevm: {
    tvl,
  }
}
