// Fountain (fURM) -- URM ecosystem, Base
// TVL = URM owed to fURM holders, capped by URM held (the contract's own
// calcDeposits()). Excludes Fortress pre-funding, kept fees and donations,
// which sit in the vault but are owed to nobody.
// URM has no DeFiLlama price, so it is valued at the URM/USDC Uni V3 TWAP
// (UrmOracle, the oracle FountainUrm and Fortress use) and reported as USDC.

const FOUNTAIN = '0x95fa3FA511Ef8DD9e48453eaE76b241D1c1AC651'; // FountainUrm v2 (fURM)
const URM = '0xf0e3349f00972475a5d16721796091aa3b997837';
const URM_ORACLE = '0xa51E78A5B3380516f9CF2c910641703d5c2e45A1';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const ONE_URM = '1000000000000000000';
const TWAP_WINDOWS = [1800, 60]; // seconds, longest first; oracle max 3600

const priceAbi =
  'function getUrmTwapUsdcPrice(uint256 amount, uint32 secondsAgo) view returns (uint256)';

async function urmPriceUsdc(api) {
  for (const twap of TWAP_WINDOWS) {
    const price = await api.call({
      target: URM_ORACLE,
      abi: priceAbi,
      params: [ONE_URM, twap],
      permitFailure: true, // too few pool observations for this window
    });
    if (price && BigInt(price) > 0n) return BigInt(price); // USDC (6 dec) per 1 URM
  }
  throw new Error('URM oracle returned no price');
}

async function tvl(api) {
  const [owed, held] = await Promise.all([
    api.call({ target: FOUNTAIN, abi: 'uint256:totalAssets' }),
    api.call({ target: URM, abi: 'erc20:balanceOf', params: [FOUNTAIN] }),
  ]);
  const deposits = BigInt(owed) < BigInt(held) ? BigInt(owed) : BigInt(held);
  const price = await urmPriceUsdc(api);
  api.add(USDC, (deposits * price) / 10n ** 18n);
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    'TVL is the URM owed to fURM holders, capped by the URM the Fountain vault holds. Pre-funded interest and buffer URM in the vault is excluded. URM is valued at its URM/USDC Uniswap V3 TWAP and reported as USDC.',
  base: { tvl },
};
