const { sumTokens2 } = require('@defillama/sdk/build/generalUtil');

const VAULT_ADDRESS = '0xB91AE2c8365FD45030abA84a4666C4dB074E53E7';
const COLLATERAL_TOKENS = ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' // WBTC
];
const abi = {
  "type": "function",
  "name": "totalReserves",
  "inputs": [{ "name": "collateral", "type": "address", "internalType": "address" }],
  "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
  "stateMutability": "view"
}

async function tvl(api) {
  // Manually fetch reserves for each token
  const reserves = await Promise.all(
    COLLATERAL_TOKENS.map(token =>
      api.call({
        abi,
        target: VAULT_ADDRESS,
        params: [token],
      })
    )
  );

  api.addTokens(COLLATERAL_TOKENS, reserves);
}

module.exports = {
  methodology: "It queries totalReserves in Vault.sol for each collateral token",
  start: 21888482,
  ethereum: { tvl }
};