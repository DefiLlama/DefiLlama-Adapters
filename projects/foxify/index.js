const { sumTokens2 } = require('../helper/unwrapLPs');

// Sonic
const contracts = [
  '0xBD87A909F9A40FdaD6D9BE703E89A0383064D0Ab', // ebFox
  '0x3725B740b33E75898e4e2E616E9BB519884edd37', // FoxMaxi
];

// Arbitrum
const arbitrumKitsuneVaultContract = '0xe5a4f22fcb8893ba0831babf9a15558b5e83446f';

async function sonicTvl(api) {
  // Fetch total supplies from both contracts
  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: contracts,
  });

  // Sum total supplies from both contracts
  const staking = supplies.reduce((sum, supply) => sum + BigInt(supply), 0n);

  api.add("coingecko:foxify", staking);

  // Return TVL as a balance object
  api.addUSDValue(staking);
  return api.getBalances() / 1e18;
}

async function arbitrumTvl(api) {
  // Fetch totalAssets from the Arbitrum Kitsune Vault contract
  const totalAssets = await api.call({
    abi: 'uint256:totalAssets',
    target: arbitrumKitsuneVaultContract,
  });

  api.addUSDValue(Number(totalAssets));
  return api.getBalances() / 1e6;
}

module.exports = {
  methodology: 'Counts the totalSupply of Foxify protocol tokens and totalAssets from Arbitrum contract',
  sonic: {
    tvl: sonicTvl,
  },
  arbitrum: {
    tvl: arbitrumTvl,
  },
};