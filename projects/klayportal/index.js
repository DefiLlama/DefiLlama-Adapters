const KlayPortalAddress = "0x67A7F7c9195214FdDE587E98f736466d26FaC5A0";

async function tvl(api) {
  const data = await api.call({ target: KlayPortalAddress, abi: "uint256:stakingPoolSum", });
  api.addGasToken(data)
}

module.exports = {
  methodology: "TVL is equal to the amount of KLAY staked in the Staking pool",
  klaytn: {
    tvl: tvl,
  },
};
