const ADDRESSES = require('../helper/coreAssets.json');

// BTCD is a synthetic basket-backed asset RFQ-minted via BTCDMinting against
// whitelisted collateral. The protocol publishes BTCDPegUsdcOracle, a
// Morpho Blue IOracle whose price() returns USDC per BTCD scaled by Morpho's
// convention 10^(36 + LOAN_DECIMALS - COLLATERAL_DECIMALS). The deployed
// oracle uses LOAN_DECIMALS = 8 (Chainlink-style, matching its decimals()
// return value for IPOR consumers) rather than USDC's actual 6, so the scale
// factor is 10^(36 + 8 - 18) = 10^26. Internally the oracle computes
// peg_USD = sqrt(BTCUSD / P0) and divides by Chainlink USDC/USD for a
// depeg-aware USDC denomination — exactly what we need to register as a
// USDC balance.
//
// TVL = BTCD.totalSupply × oracle.price() / 10^38. The result is registered
// as USDC so DefiLlama's native USDC pricing handles the conversion to USD.
//
// sBTCD (BTCDStaking) is a wrapper of BTCD whose underlying is already in
// BTCD.totalSupply, so including it would double-count.

const BTCD = '0xC6694e05B750015f54Ac646544a4a9D33cbe4086';
const BTCD_PEG_USDC_ORACLE = '0x8f3B198615acdFF41d80d03b980DB2Db390d6D6a';

// Scale: totalSupply (BTCD raw, 18 dec) × price() (USDC per BTCD × 10^26)
//        ÷ 10^(18 + 26 - 6) = USDC raw amount (6 dec).
const SCALE_TO_USDC = 10n ** 38n;

const priceAbi = 'function price() view returns (uint256)';

async function ethereumTvl(api) {
  const [supply, price] = await Promise.all([
    api.call({ target: BTCD, abi: 'erc20:totalSupply' }),
    api.call({ target: BTCD_PEG_USDC_ORACLE, abi: priceAbi }),
  ]);
  // Morpho spec: price() returns 0 on bad feed data instead of reverting.
  // Surface that as a hard error rather than silently registering $0 TVL.
  if (BigInt(price) === 0n) {
    throw new Error('BTCDPegUsdcOracle.price() returned 0 (bad feed data)');
  }
  const usdcAmount = (BigInt(supply) * BigInt(price)) / SCALE_TO_USDC;
  api.add(ADDRESSES.ethereum.USDC, usdcAmount.toString());
}

module.exports = {
  methodology:
    'TVL = BTCD.totalSupply × BTCDPegUsdcOracle.price(), denominated in USDC. ' +
    'The oracle returns a depeg-aware BTCD/USDC price (peg = sqrt(BTCUSD / P0) ' +
    'divided by Chainlink USDC/USD). The result is registered as a USDC balance ' +
    "so DefiLlama's native USDC pricing handles the conversion to USD.",
  ethereum: { tvl: ethereumTvl },
};
