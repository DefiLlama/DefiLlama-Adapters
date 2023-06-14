const sdk = require("@defillama/sdk");
const abi = require("./abi.js");
const USDW4_TOKEN_CONTRACT = "0xadf789e61bf38c463e4ba5b2b6e9c1af6659e11b";
const TBILL_VAULT_CLUB_BOND_CONTRACT =
  "0xd86FFB404147163e19E010a0e9d4995E0e36F335";

async function tvl(_, _1, _2, { api }) {
  const totalSupply = await api.call({
    abi: "erc20:totalSupply",
    target: USDW4_TOKEN_CONTRACT,
  });

  const decimals = await api.call({
    abi: "erc20:decimals",
    target: USDW4_TOKEN_CONTRACT,
  });

  const vaultBalance = await api.call({
    abi: "erc20:balanceOf",
    target: USDW4_TOKEN_CONTRACT,
    params: [TBILL_VAULT_CLUB_BOND_CONTRACT],
  });

  const { vaultToken, baseToken } = await api.call({
    abi: abi.currentExchangeRate,
    target: TBILL_VAULT_CLUB_BOND_CONTRACT,
  });

  return {
    "usd-coin":
      (totalSupply - vaultBalance) / (vaultToken / baseToken) / 10 ** decimals,
  };
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Calculates the TVL of the General Purpose T-Bills Vault.",
  start: 16685700,
  ethereum: {
    tvl,
  },
};
