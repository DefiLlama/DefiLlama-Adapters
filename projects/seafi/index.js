const GGPVAULT_CONTRACT = "0xdF34022e8a280fc79499cA560439Bb6f9797EbD8";
const AVAXVAULT_CONTRACT = "0x36213ca1483869c5616be738Bf8da7C9B34Ace8d";
const GGP = "0x69260B9483F9871ca57f81A90D91E2F96c2Cd11d";
const wAVAX = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";

async function ggpVaultTvl(api) {
  const bal = await api.call({
    abi: "uint256:totalAssets",
    target: GGPVAULT_CONTRACT,
  });
  api.add(GGP, bal);
}

async function avaxVaultTvl(api) {
  const bal = await api.call({
    abi: "uint256:totalAssets",
    target: AVAXVAULT_CONTRACT,
  });
  api.add(wAVAX, bal);
}

async function tvl(api) {
  await ggpVaultTvl(api);
  await avaxVaultTvl(api);
}

module.exports = {
  avax: {
    tvl: tvl,
  },
};
