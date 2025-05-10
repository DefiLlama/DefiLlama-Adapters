const ADDRESSES = require("../helper/coreAssets.json");
const USCC = "0x14d60e7fdc0d71d8611742720e4c50e7a974020c";

async function tvl(api) {
  const totalSupplies = await api.call({
    target: USCC,
    abi: "erc20:totalSupply",
  });
  api.add(USCC, totalSupplies);
}

async function tvl_plume(api) {
  const totalSupplies = await api.call({
    target: ADDRESSES.plume_mainnet.USCC,
    abi: "erc20:totalSupply",
  });
  api.add(ADDRESSES.plume_mainnet.USCC, totalSupplies);
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
