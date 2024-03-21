const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const mapLockedAmount = await api.call({
    target: "0x000000000000000000000000000000000000d011",
    abi: "function getAccountTotalLockedGold(address) view returns (uint256)",
    params: ["0x2Ef75B32C26bC92977998C6D19e527E49fAD0D9B"],
  });

  api.add(ADDRESSES.map.WMAPO, mapLockedAmount)
}

module.exports = {
  map: { tvl, }
};
