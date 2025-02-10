const { treasuryExports } = require("../helper/treasury")
const { calcLpTvl, CONTRACTS } = require("../zoo/utils.js");

const treasury = '0x54c56e149f6d655aa784678057d1f96612b0cf1a';

async function tvl(api) {
  const lpBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: CONTRACTS.beraSwapLpHoneyUsdc,
    params: [treasury],
  });

  await calcLpTvl(api, lpBalance, CONTRACTS.beraSwapLpHoneyUsdc, CONTRACTS.USDC, CONTRACTS.HONEY);
}

module.exports = {
  berachain: {
    tvl,
  }
};