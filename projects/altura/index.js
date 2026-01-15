const VAULT = "0xd0Ee0CF300DFB598270cd7F4D0c6E0D8F6e13f29";
const ASSET = "0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb";

const NAV_VAULT_ABI_MIN = [
  {
    type: "function",
    name: "totalAssets",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
];

async function tvl(api) {
  const assets = await api.call({
    target: VAULT,
    abi: NAV_VAULT_ABI_MIN[0],
  });

  api.add(ASSET, assets);
}

module.exports = {
  methodology:
    "TVL is computed as the vault's totalAssets() and is attributed to the underlying asset token.",
  hyperliquid: {
    tvl,
  },
};
