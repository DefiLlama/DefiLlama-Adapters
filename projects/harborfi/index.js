// TODO: Dynamic discovery via factory events was attempted but failed due to missing events on-chain.
// The factory (0xd696e56b3a054734d4c6dcbd32e11a278b0ec458) is expected to emit:
//   factory.deployed(address contract, string identifier)
// However, no such events were found (as of Jan 2025).
// Once the factory is upgraded to emit these events, dynamic discovery should be implemented.

const { KNOWN_MINTERS, GENESIS_CONTRACTS } = require('./addresses');

async function tvl(api) {
  // Combine minters and genesis contracts
  const allContracts = [...KNOWN_MINTERS, ...GENESIS_CONTRACTS];

  const collateralTokens = await api.multiCall({ abi: 'address:WRAPPED_COLLATERAL_TOKEN', calls: allContracts, });
  return api.sumTokens({ tokensAndOwners2: [collateralTokens, allContracts] });
}

module.exports = {
  methodology: 'TVL is calculated by summing the balances of collateral tokens held by all 0xHarborFi minter and genesis contracts. Each contract\'s collateral token is queried dynamically using WRAPPED_COLLATERAL_TOKEN().',
  ethereum: {
    tvl,
  },
};
