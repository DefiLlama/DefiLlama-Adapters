const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require("../helper/coreAssets.json");

const MILK_CONTRACT = "0x6E0090dBecF3b4F0F9429637756CaDD8Fc468C54";

async function borrowed(api) {
  // Total USDC borrowed against MILK collateral
  const totalBorrowed = await api.call({
    abi: "function getTotalBorrowed() view returns (uint256)",
    target: MILK_CONTRACT,
  });
  api.add(ADDRESSES.base.USDC, totalBorrowed);
}

module.exports = {
  methodology:
    "TVL is the total USDC held by the MILK contract. Borrowed shows USDC lent out against MILK collateral.",
  base: {
    tvl: sumTokensExport({ owner: MILK_CONTRACT, tokens: [ADDRESSES.base.USDC] }),
    borrowed,
  },
};
