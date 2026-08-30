// DefiLlama TVL adapter — SouthPole USDC Vault (ERC-4626) on Arbitrum
const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // Arbitrum native USDC
const VAULT = "0xeA59d9343FF0d70470DD6709cfCD5Bc735d9aDBC"; // SouthPole USDC Vault

async function tvl(api) {
  return api.sumTokens({ owner: VAULT, tokens: [USDC] });
}

module.exports = {
  methodology:
    "TVL counts the USDC deposited into the SouthPole USDC vault (a standard ERC-4626 vault) on Arbitrum.",
  arbitrum: { tvl },
};
