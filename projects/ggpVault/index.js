const GGPVAULT_CONTRACT = "0xdF34022e8a280fc79499cA560439Bb6f9797EbD8";
const GGP = "0x69260B9483F9871ca57f81A90D91E2F96c2Cd11d";

async function tvl(api) {
  const bal = await api.call({
    abi: "uint256:totalAssets",
    target: GGPVAULT_CONTRACT,
  });
  api.add(GGP, bal);
}

module.exports = {
  avax: {
    tvl,
  },
};
