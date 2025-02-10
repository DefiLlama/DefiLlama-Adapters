
const { calcLpTvl, CONTRACTS } = require("./utils.js");

async function tvl(api) {
  const lpBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: CONTRACTS.infrared,
    params: [CONTRACTS.zooBribeVaultHoneyUsdc],
  });

  await calcLpTvl(api, lpBalance, CONTRACTS.beraSwapLpHoneyUsdc, CONTRACTS.USDC, CONTRACTS.HONEY);
}

module.exports = {
  berachain: {
    tvl,
  }
};