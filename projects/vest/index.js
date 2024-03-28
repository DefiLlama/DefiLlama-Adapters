const USDC = "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4";
const Exchange = "0xf7483A1464DeF6b8d5A6Caca4A8ce7E5be8F1F68";

async function tvl(_, _1, _2, { api }) {
  const collateralBalance = await api.call({
    abi: "erc20:balanceOf",
    target: USDC,
    params: [Exchange],
  });

  api.add(USDC, collateralBalance);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Total USDC locked in the Vest Exchange.",
  start: 1710709200,
  era: {
    tvl,
  },
};
