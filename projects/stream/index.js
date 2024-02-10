const sdk = require("@defillama/sdk");
const abi = require("./abi.js");
const USDW4_TOKEN_CONTRACT = "0xadf789e61bf38c463e4ba5b2b6e9c1af6659e11b";
const LEVUSDC_VAULT_CONTRACT= "0xf3b466F09ef476E311Ce275407Cfb09a8D8De3a7";
const HODLWBTC_VAULT_CONTRACT = "0x6efa12b38038A6249B7aBdd5a047D211fB0aD48E"
const HODLWETH_VAULT_CONTRACT = "0x2a2f84e9AfE7b39146CDaF068b06b84EE23892c2"
const TBILL_VAULT_CLUB_BOND_CONTRACT =
  "0xd86FFB404147163e19E010a0e9d4995E0e36F335";

async function tvl(_, _1, _2, { api }) {
  const usdw4_totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: USDW4_TOKEN_CONTRACT,
  });

  const usdw4_decimals = await api.call({
    abi: "erc20:decimals",
    target: USDW4_TOKEN_CONTRACT,
  });

  const usdw4_vaultBalance = await api.call({
    abi: "erc20:balanceOf",
    target: USDW4_TOKEN_CONTRACT,
    params: [TBILL_VAULT_CLUB_BOND_CONTRACT],
  });

  const { vaultToken, baseToken } = await api.call({
    abi: abi.currentExchangeRate,
    target: TBILL_VAULT_CLUB_BOND_CONTRACT,
  });

  const usdc_totalBalance = await api.call({
    abi: abi.totalBalance,
    target: LEVUSDC_VAULT_CONTRACT,
  });

  const wbtc_totalBalance = await api.call({
    abi: abi.totalBalance,
    target: HODLWBTC_VAULT_CONTRACT,
  });

  const weth_totalBalance = await api.call({
    abi: abi.totalBalance,
    target: HODLWETH_VAULT_CONTRACT,
  });

  const usdw4_total = (usdw4_totalSupply - usdw4_vaultBalance) / (vaultToken / baseToken) / 10 ** usdw4_decimals;
  const usdc_total = (usdc_totalBalance / 10 ** 6) + usdw4_total;
  const wbtc_total = wbtc_totalBalance / 10 ** 8;
  const weth_total = weth_totalBalance / 10 ** 18;

  return {
    "usd-coin":
      usdc_total,
    bitcoin:
      wbtc_total,
    ethereum:
      weth_total,
  };
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Calculates the TVL of all Stream vaults",
  start: 16685700,
  ethereum: {
    tvl,
  },
};
