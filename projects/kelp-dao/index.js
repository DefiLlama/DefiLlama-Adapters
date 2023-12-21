const DEPOSIT_POOL = "0x036676389e48133B63a802f8635AD39E752D375D";
const ETHx = "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b";
const stETH = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84";

async function getTotalAssetDeposits(api, tokenAddress) {
  return await api.call({
    abi: "function getTotalAssetDeposits(address) external view returns (uint256)",
    target: DEPOSIT_POOL,
    params: [tokenAddress],
  });
}

async function tvl(_, _1, _2, { api }) {
  const tokens = [ETHx, stETH];
  const depositPromises = tokens.map((token) =>
    getTotalAssetDeposits(api, token)
  );
  const depositValues = await Promise.all(depositPromises);

  api.addTokens(tokens, depositValues);
}

module.exports = {
  methodology:
    "deposited LSTs in deposit pool, node delegator contracts and from them into eigenlayer strategy contracts",
  ethereum: {
    tvl,
  },
};
