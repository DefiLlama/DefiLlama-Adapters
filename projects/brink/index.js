const abis = {
  asset: "function asset() view returns (address)",
  balance: "function totalAssets() external view returns (uint256)",
};

const baseVaults = [
  "0x4aA4AdA8d8aB95a6e06dc90E4699bdD09C648778", // aave + morpho
];

const mantleVaults = [
  "0xE12EED61E7cC36E4CF3304B8220b433f1fD6e254", // lendle
  "0x5A285484126D4e1985AC2cE0E1869D6384027727", // lendle
  "0xf36a57369362eB1553f24C8ad50873723E6e1173", // lendle
];

async function baseTvl(api) {
  const assets = await api.multiCall({ abi: abis.asset, calls: baseVaults });
  const balances = await api.multiCall({ abi: abis.balance, calls: baseVaults });
  baseVaults.forEach((v, i) => {
    api.add(assets[i], balances[i]);
  });
}

async function mantleTvl(api) {
  const assets = await api.multiCall({ abi: abis.asset, calls: mantleVaults });
  const balances = await api.multiCall({ abi: abis.balance, calls: mantleVaults });
  mantleVaults.forEach((v, i) => {
    api.add(assets[i], balances[i]);
  });
}
  
module.exports = {
  base: {
    tvl: baseTvl
  },
  mantle: {
    tvl: mantleTvl
  }
};