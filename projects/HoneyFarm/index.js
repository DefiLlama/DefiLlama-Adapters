const { addFundsInMasterChef } = require("../helper/masterchef");
const { staking } = require("../helper/staking");

async function avax(timestamp, _, {avax: block}) {
  let balances = {};
  const transform = addr => 'avax:'+addr

  await addFundsInMasterChef(
    {},
    "0x757490104fd4C80195D3C56bee4dc7B1279cCC51",
    block,
    "avax",
    transform,
    undefined,
    ["0xB669c71431bc4372140bC35Aa1962C4B980bA507"]
  );
  return balances;
}

async function bsc(timestamp, _, {bsc: block}) {
  let balances = {};
  const transform = addr => 'bsc:'+addr

  await addFundsInMasterChef(
    {},
    "0x88E21dedEf04cf24AFe1847B0F6927a719AA8F35",
    block,
    "bsc",
    transform,
    undefined,
    ["0x1A8d7AC01d21991BF5249A3657C97b2B6d919222"]
  );
  return balances;
}

module.exports = {
  methodology:
    "Only staked LP is counted as TVL. Excluded in TVL : Locked BEE in the RoyalJelly, NFT Jelly, value of BNB & xJOE which aren't on CoinGecko yet.",
  avax:{
    tvl: avax,
    staking: staking(
      "0x757490104fd4C80195D3C56bee4dc7B1279cCC51",
      "0xB669c71431bc4372140bC35Aa1962C4B980bA507",
      "avax"
    ),
  },
  bsc: {
    tvl: bsc,
    staking: staking(
      "0x88E21dedEf04cf24AFe1847B0F6927a719AA8F35",
      "0x1A8d7AC01d21991BF5249A3657C97b2B6d919222",
      "bsc"
    ),
  },
}; // node test.js projects/HoneyFarm/index.js
