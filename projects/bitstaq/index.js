const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const mapLockedAmount = await api.call({
    target: "0x000000000000000000000000000000000000d011",
    abi: "function getAccountTotalLockedGold(address) view returns (uint256)",
    params: ["0x9bD1E0a3A727D0d4F4e9A6d59022E071DDc79924"],
  });

  api.add(ADDRESSES.map.WMAPO, mapLockedAmount)
}

module.exports = {
  map: { tvl, }
};
