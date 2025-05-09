const USTB = "0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e";
const USTB_PLUME = "0xE4fA682f94610cCd170680cc3B045d77D9E528a8";

async function tvl(api) {
  const totalSupplies = await api.call({
    target: USTB,
    abi: "erc20:totalSupply",
  });
  api.add(USTB, totalSupplies);
}

async function tvl_plume(api) {
  const totalSupplies = await api.call({
    target: USTB_PLUME,
    abi: "erc20:totalSupply",
  });
  api.add(USTB_PLUME, totalSupplies);
}

module.exports = {
  methodology: "TVL corresponds to the total amount of USTB & USCC minted onchain, does not include Superstate book-entry AUM",
  ethereum: {
    tvl: tvl
  },
  plume_mainnet: {
    tvl: tvl_plume
  },
};
