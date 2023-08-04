const sdk = require("@defillama/sdk");

/*
Merkl doesn't have any TVL as no funds are staked on the contracts. 
This adapter was made to integrate Merkl in the Yields dashboard. 
For more information on Merkl, see here: https://docs.angle.money/side-products/merkl
*/

async function tvl() {
  const balances = {};
  return balances;
}

module.exports = {
  methodology:
    "Merkl is a side product from Angle Labs used to better reward concentrated liquidity positions. It doesn't have any TVL. See the yield dashboard for a list of Merkl pools.",
  ethereum: {
    tvl,
  },
  polygon: {
    tvl,
  },
  optimism: {
    tvl,
  },
  arbitrum: {
    tvl,
  },
};
