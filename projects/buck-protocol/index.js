// BUCK Protocol — Bitcoin-backed yield-bearing savings coin
// TVL = total BUCK supply (each BUCK backed by STRC collateral + USDC reserves)

const BUCK = "0xdb13997f4D83EF343845d0bAEb27d1173dF8c224";

async function tvl(api) {
  const supply = await api.call({
    abi: "erc20:totalSupply",
    target: BUCK,
  });
  api.add(BUCK, supply);
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL is the total supply of BUCK, a yield-bearing savings coin backed by STRC (Strategy preferred stock) collateral and USDC reserves. Each BUCK is redeemable at the Liquidity Window.",
  ethereum: { tvl },
};
