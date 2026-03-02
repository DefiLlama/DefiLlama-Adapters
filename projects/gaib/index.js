// AID token address — same on all chains (LayerZero OFT + CREATE2)
const AID = "0x18F52B3fb465118731d9e0d276d4Eb3599D57596";

// sAID ERC-4626 vault (Ethereum only)
const SAID_VAULT = "0xB3B3c527BA57cd61648e2EC2F5e006A0B390A9F8";

async function tvl(api) {
  const supply = await api.call({ abi: "erc20:totalSupply", target: AID });
  // Price AID via ethereum mapping so non-ethereum chain balances are valued too.
  api.add(`ethereum:${AID}`, supply, { skipChain: true });
}

// sAID staking — AID locked in the vault. Shown as sub-category, not double-counted.
async function staking(api) {
  const supply = await api.call({ abi: "erc20:totalSupply", target: SAID_VAULT });
  api.add(`ethereum:${SAID_VAULT}`, supply, { skipChain: true });
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
  sei: { tvl: () => ({}) },
  sty: { tvl: () => ({}) },
  hallmarks: [
    ["2024-11-01", "AID & sAID mainnet launch"],
  ],
};
