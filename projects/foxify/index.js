const { sumTokens2 } = require('../helper/unwrapLPs');

const contracts = [
  '0xBD87A909F9A40FdaD6D9BE703E89A0383064D0Ab', // ebFox
  '0x3725B740b33E75898e4e2E616E9BB519884edd37', // FoxMaxi
];

async function tvl(api) {
  // Fetch total supplies from both contracts
  const supplies = await api.multiCall({
    abi: 'erc20:totalSupply',
    calls: contracts,
  });

  // Sum total supplies from both contracts
  const totalSupply = supplies.reduce((sum, supply) => sum + BigInt(supply), 0n);

  // Fetch Fox token price from DexScreener
  const priceResponse = await fetch('https://api.dexscreener.com/latest/dex/pairs/sonic/0x488dbe6640a9b746130c43ab0668eca4418cee9a');
  const priceData = await priceResponse.json();
  const foxPrice = parseFloat(priceData.pair.priceUsd);

  // Calculate TVL: total supply * price
  const tvlValue = (Number(totalSupply) / 1e18) * foxPrice;

  // Return TVL as a balance object
  api.addUSDValue(tvlValue);
  return api.getBalances();
}

module.exports = {
  methodology: 'Counts the totalSupply of Foxify protocol tokens',
  sonic: {
    tvl,
  },
};