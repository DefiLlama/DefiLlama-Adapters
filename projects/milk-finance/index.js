const ADDRESSES = require("../helper/coreAssets.json");

const MILK_CONTRACT = "0x6E0090dBecF3b4F0F9429637756CaDD8Fc468C54";
const USDC_BASE = ADDRESSES.base.USDC;

async function tvl(api) {
  // TVL = total USDC backing in the MILK contract
  // getBacking() = contract USDC balance + total borrowed
  const backing = await api.call({
    abi: "function getBacking() view returns (uint256)",
    target: MILK_CONTRACT,
  });
  api.add(USDC_BASE, backing);
}

async function borrowed(api) {
  // Total USDC borrowed against MILK collateral
  const totalBorrowed = await api.call({
    abi: "function getTotalBorrowed() view returns (uint256)",
    target: MILK_CONTRACT,
  });
  api.add(USDC_BASE, totalBorrowed);
}

module.exports = {
  methodology:
    "TVL is the total USDC backing held by the MILK contract (contract USDC balance + outstanding borrows). Borrowed shows USDC lent out against MILK collateral.",
  base: {
    tvl,
    borrowed,
  },
};
