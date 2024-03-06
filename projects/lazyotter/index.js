const SCROLL_AAVE_USDC_VAULT = "0x7100409baaeda121ab92f663e3ddb898f11ff745";
const SCROLL_AAVE_WETH_VAULT = "0x844Ccc93888CAeBbAd91332FCa1045e6926a084d";

const SCROLL_USDC = "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4";
const SCROLL_WETH = "0x5300000000000000000000000000000000000004";

async function tvl(_, _1, _2, { api }) {
  const USDCBalance = await api.call({
    abi: "function totalAssets() view returns (uint256)",
    target: SCROLL_AAVE_USDC_VAULT,
  });

  const WETHBalance = await api.call({
    abi: "function totalAssets() view returns (uint256)",
    target: SCROLL_AAVE_WETH_VAULT,
  });

  api.add(SCROLL_USDC, USDCBalance);
  api.add(SCROLL_WETH, WETHBalance);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "",
  scroll: {
    tvl,
  },
};
