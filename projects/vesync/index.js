const { getUniTVL } = require('./getUniTVL');
const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');

const GET_AMOUNT_OUT = "function getAmountOut(uint amountIn, address tokenIn, address tokenOut) external view returns (uint amount, bool stable)";

const VOTING_ESCROW = "0x1925AB9F9bcdB9E2D2861cc7C4c157645126D9d9";
const VS = "0x5756A28E2aAe01F600FC2C01358395F5C1f8ad3A";
const ROUTER = "0x6C31035D62541ceba2Ac587ea09891d1645D6D07";
const USDC = "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4";

const E18 = "1000000000000000000";
const E6 = "1000000";

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: '0x529Bd7Fc43285B96f1e8d5158626d1F15bb8A834',
      useDefaultCoreAssets: true,
      hasStablePools: true,
    }),
    staking: async (_, _b, cb, { chain, block, api } = {}) => {
      if (!chain) {
        chain = _chain
        block = cb[chain]
      }

      const vsBalance = await sdk.api.erc20.balanceOf({
        target: VS,
        owner: VOTING_ESCROW,
        chain,
        block,
      })

      // Use 1 VS as input to get the conversion rate from VS to USDC
      const [conversionRate, __] = await api.call({
        target: ROUTER,
        abi: GET_AMOUNT_OUT,
        params: [E18, VS, USDC]
      })

      return {
        "usd-coin": BigNumber(vsBalance.output).div(E18).times(conversionRate).div(E6).toFixed(0)
      }
    }
  },
  methodology: "TVL is total liquidity of all liquidity pools. Staking TVL is the value of VS tokens locked in the voting escrow (veVS) contract.",
};