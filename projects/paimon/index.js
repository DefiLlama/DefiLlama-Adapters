const ADDRESSES = require("../helper/coreAssets.json");

const PP = "0x8505c32631034A7cE8800239c08547e0434EdaD9";
const USDT = ADDRESSES.bsc.USDT;

const abi = {
  totalSupply: "uint256:totalSupply",
  sharePrice: "uint256:sharePrice",
};

async function tvl(api) {
  const totalSupply = await api.call({ target: PP, abi: abi.totalSupply });

  const sharePrice = await api.call({ target: PP, abi: abi.sharePrice });

  const tvl = (totalSupply * sharePrice) / 1e18;
  api.add(USDT, tvl);
}

module.exports = {
  bsc: {
    tvl,
  },
  methodology: "TVL is calculated as the total assets held in the Paimon (PP) ERC-4626 vault contract",
};
