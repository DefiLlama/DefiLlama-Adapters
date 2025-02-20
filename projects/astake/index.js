const sdk = require("@defillama/sdk");

const VAULT_ADDRESS = "0x0DC6E8922ac0ECa8287ba22Db14C9Ac9317ed18F"  
const ASTR_TOKEN = "0x0000000000000000000000000000000000000000" 
const CHAIN = "astar"

async function tvl(timestamp, block, chainBlocks) {
  const totalAssets = await sdk.api.abi.call({
    target: VAULT_ADDRESS,
    abi: {
      "inputs": [],
      "name": "totalAssets",
      "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "stateMutability": "view",
      "type": "function"
    },
    chain: CHAIN,
    block: chainBlocks[CHAIN]
  });

  const balances = {};
  
  sdk.util.sumSingleBalance(
    balances,
    `${CHAIN}:${ASTR_TOKEN}`, 
    totalAssets.output
  );

  return balances;
}

module.exports = {
  methodology: "Calculates the total amount of ASTR tokens deposited in the ERC4626 vault",
  astar: {
    tvl
  },
}
