
const MaximizerStaking = "0x6d7AD602Ec2EFdF4B7d34A9A53f92F06d27b82B1";
const MAXI = "0x7C08413cbf02202a1c13643dB173f2694e0F73f0";
const staking = async (api) => api.sumTokens({ owner: MaximizerStaking, token: MAXI })

module.exports = {
  avax: {
    tvl: () => ({}),
    staking,
  },
  deadFrom: '2022-06-13',
  methodology:
    "Counts MAXI, MAXI LP (MAXI-DAI.e JLP, MAXI-WAVAX PGL), DAI.e, USDC, WAVAX, liquidity tokens (PGL, JLP), single partner tokens on the treasury and allocators",
};
