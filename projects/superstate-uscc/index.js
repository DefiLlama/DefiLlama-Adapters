const USCC = "0x14d60e7fdc0d71d8611742720e4c50e7a974020c";
const USCC_PLUME = "0x4c21B7577C8FE8b0B0669165ee7C8f67fa1454Cf";

async function tvl(api) {
  const totalSupplies = await api.call({
    target: USCC,
    abi: "erc20:totalSupply",
  });
  api.add(USCC, totalSupplies);
}

async function tvl_plume(api) {
  const totalSupplies = await api.call({
    target: USCC_PLUME,
    abi: "erc20:totalSupply",
  });
  api.add(USCC_PLUME, totalSupplies);
}

module.exports = {
  methodology: "TVL corresponds to the total amount of USCC minted onchain, does not include Superstate book-entry AUM",
  ethereum: {
    tvl: tvl
  },
  plume_mainnet: {
    tvl: tvl_plume
  },
};
