const ADDRESSES = require("../helper/coreAssets.json");

// Investorus Club FinLP (ERC-20 shares)
const FIN_LP = "0x639F1822e58BbDc38D880f610b4bCeF907A94FCA";

async function ethTvl(api) {
  api.add(ADDRESSES.ethereum.USDT, await api.call({ abi: "uint256:totalHoldings", target: FIN_LP, }))
}

module.exports = {
  misrepresentedTokens: false,
  ethereum: {
    tvl: ethTvl,
  },
  hallmarks: [["2026-02-10", "The smart contract was created"]],
  methodology:
    "TVL is the totalHoldings reported by the Investorus Club FinLP vault (USDT-settled).",
};
