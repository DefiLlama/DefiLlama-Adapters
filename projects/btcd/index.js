const ADDRESSES = require('../helper/coreAssets.json');

// BTCD is a synthetic basket-backed asset RFQ-minted via BTCDMinting against
// whitelisted collateral. The protocol publishes BTCDPegUsdcOracle, a
// Chainlink-compatible IPriceOracle that returns BTCD/USDC in 8 decimals
// (peg = sqrt(BTCUSD / P0)). We use that as the canonical pricing source.
//
// TVL = BTCD.totalSupply × oracle answer, registered as a USDC balance so
// DefiLlama's native USDC pricing handles the conversion to USD.
//
// sBTCD (BTCDStaking) is a wrapper of BTCD whose underlying is already in
// BTCD.totalSupply, so including it would double-count.

const BTCD = '0xC6694e05B750015f54Ac646544a4a9D33cbe4086';
const BTCD_PEG_USDC_ORACLE = '0x8f3B198615acdFF41d80d03b980DB2Db390d6D6a';

// Scale: BTCD totalSupply (18 dec) × oracle answer (8 dec USDC per BTCD)
//        ÷ 10^(18 + 8 - 6) = USDC raw amount (6 dec).
const SCALE_TO_USDC = 10n ** 20n;

const latestRoundDataAbi =
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)';

async function ethereumTvl(api) {
  const [supply, round] = await Promise.all([
    api.call({ target: BTCD, abi: 'erc20:totalSupply' }),
    api.call({ target: BTCD_PEG_USDC_ORACLE, abi: latestRoundDataAbi }),
  ]);
  const usdcAmount = (BigInt(supply) * BigInt(round.answer)) / SCALE_TO_USDC;
  api.add(ADDRESSES.ethereum.USDC, usdcAmount.toString());
}

module.exports = {
  methodology:
    'TVL = BTCD.totalSupply × BTCDPegUsdcOracle.latestRoundData(). The oracle ' +
    'returns BTCD/USDC in 8 decimals (peg = sqrt(BTCUSD / P0)). The result ' +
    "is registered as a USDC balance so DefiLlama's native USDC pricing " +
    'handles the conversion to USD. sBTCD (BTCDStaking) is a wrapper of BTCD ' +
    'whose underlying is already counted in BTCD.totalSupply, so including ' +
    'it would double-count.',
  ethereum: { tvl: ethereumTvl },
};
