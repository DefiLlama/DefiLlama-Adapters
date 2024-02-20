const GGPVAULT_CONTRACT = "0xdF34022e8a280fc79499cA560439Bb6f9797EbD8";
const ggAVAX = "0xA25EaF2906FA1a3a13EdAc9B9657108Af7B703e3";

async function tvl(_, _b, _cb, { api }) {
  const token = await api.call({ abi: "address:asset", target: ggAVAX });

  const bal = await api.call({
    abi: "uint256:totalAssets",
    target: GGPVAULT_CONTRACT,
  });

  api.add(token, bal);
}

module.exports = {
  avax: {
    tvl,
  },
};
