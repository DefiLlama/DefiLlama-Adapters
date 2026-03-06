const abi = {
    "getAllAssets": "address[]:getAllAssets",
    "checkBalance": "function checkBalance(address _asset) view returns (uint256 balance)",
    "supportsAsset": "function supportsAsset(address _asset) view returns (bool)"
  };

const vault = "0xE75D77B1865Ae93c7eaa3040B038D7aA7BC02F70";

const ethTvl = async (api) => {
  const tokens = await api.call({  abi: abi.getAllAssets, target: vault})
  const bals = await api.multiCall({  abi: abi.checkBalance, calls: tokens, target: vault})
  api.add(tokens, bals)
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
};
