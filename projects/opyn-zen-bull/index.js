const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')

const { eulerSimpleLens } = require('./abi');

const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const ZEN_BULL_ADDRESS = "0xb46Fb07b0c80DBC3F97cae3BFe168AcaD46dF507";
const EULER_SIMPLE_LENS_ADDRESS = "0x5077B7642abF198b4a5b7C4BdCE4f03016C7089C"
const crab = "0x3B960E47784150F5a63777201ee2B15253D713e8";

// to add TVL under yield category
async function tvl(timestamp, block, _, { api }) {
  let balances = {};

  const bullDtokenBalance = await api.call({
    target: EULER_SIMPLE_LENS_ADDRESS,
    abi: eulerSimpleLens.getDTokenBalance,
    params: [USDC, ZEN_BULL_ADDRESS],
  })
  const bullEtokenBalance = await api.call({
    target: EULER_SIMPLE_LENS_ADDRESS,
    abi: eulerSimpleLens.getETokenBalance,
    params: [WETH, ZEN_BULL_ADDRESS],
  })

  sdk.util.sumSingleBalance(balances, WETH, bullEtokenBalance)
  sdk.util.sumSingleBalance(balances, USDC, bullDtokenBalance)
  return sumTokens2({ balances, api, owner: ZEN_BULL_ADDRESS, tokens: [crab] })
};

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl
  }
};