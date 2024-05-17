const ADDRESSES = require('../helper/coreAssets.json')
const { getUniTVL } = require('../helper/unknownTokens');

const GET_AMOUNT_OUT = "function getAmountOut(uint amountIn, address tokenIn, address tokenOut) external view returns (uint amount, bool stable)";

const VOTING_ESCROW = "0x1925AB9F9bcdB9E2D2861cc7C4c157645126D9d9";
const VS = "0x5756A28E2aAe01F600FC2C01358395F5C1f8ad3A";
const ROUTER = "0x6C31035D62541ceba2Ac587ea09891d1645D6D07";
const USDC = ADDRESSES.era.USDC;

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: '0x529Bd7Fc43285B96f1e8d5158626d1F15bb8A834',
      useDefaultCoreAssets: true,
      hasStablePools: true,
    }),
    staking: async (api = {}) => {
      const vsBalance = await api.call({ target: VS, abi: 'erc20:balanceOf', params: VOTING_ESCROW, })

      // Use 1 VS as input to get the conversion rate from VS to USDC
      const [conversionRate] = await api.call({ target: ROUTER, abi: GET_AMOUNT_OUT, params: [''+1e18, VS, USDC] })

      return {
        "usd-coin": vsBalance *conversionRate / 1e24
      }
    }
  },
  methodology: "TVL is total liquidity of all liquidity pools. Staking TVL is the value of VS tokens locked in the voting escrow (veVS) contract.",
};