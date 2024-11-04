const CAVIAR = "0xB08F026f8a096E6d92eb5BcbE102c273A7a2d51C";
const sCVR = "0x7f8F92C2446E044af45DCf15476Bc931Fd1d0020";

async function tvl(api) {
  // Fetch balance of CVR within sCVR contract
  const amount = await api.call({
    abi: "erc20:balanceOf",
    target: CAVIAR,
    params: [sCVR],
  });

  api.add(CAVIAR, amount);
}

module.exports = {
  real: { tvl, },
}
