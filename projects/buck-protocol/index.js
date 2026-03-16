// BUCK Protocol — yield-bearing savings coin
// TVL = total BUCK supply (backed by on-chain USDC reserves + attested STRC portfolio value)

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
    "TVL is represented as total BUCK supply. BUCK is backed by a combination of on-chain USDC reserve liquidity and attested off-chain STRC portfolio value.",
  ethereum: { tvl },
};
