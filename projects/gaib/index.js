// AID token address — same on all chains (LayerZero OFT + CREATE2)
const AID = "0x18F52B3fb465118731d9e0d276d4Eb3599D57596";

// sAID ERC-4626 vault (Ethereum only)
const SAID_VAULT = "0xB3B3c527BA57cd61648e2EC2F5e006A0B390A9F8";

// USDC addresses per chain — used as pricing proxy since AID = $1
const USDC = {
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  bsc: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
};

async function tvl(api) {
  const supply = await api.call({ abi: "erc20:totalSupply", target: AID });
  // AID has 18 decimals; USDC has 6 on Ethereum/Arbitrum/Base, 18 on BSC
  api.add(USDC[api.chain], api.chain === "bsc" ? supply : supply / 1e12);
}

// sAID staking — AID locked in the vault. Shown as sub-category, not double-counted.
async function staking(api) {
  const totalAssets = await api.call({ abi: "uint256:totalAssets", target: SAID_VAULT });
  api.add(USDC.ethereum, totalAssets / 1e12);
}

module.exports = {
  methodology:
    "TVL is the total supply of AID (AI Dollar) across all deployed chains. AID is a synthetic dollar backed 1:1 by US Treasuries and stablecoins. sAID staking shows AID deposited in the ERC-4626 yield vault.",
  misrepresentedTokens: true,
  timetravel: true,
  start: 1730419200,
  ethereum: { tvl, staking },
  arbitrum: { tvl },
  base: { tvl },
  bsc: { tvl },
  hallmarks: [
    [1730419200, "AID & sAID mainnet launch"],
  ],
};
