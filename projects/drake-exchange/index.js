/**
 * Drake Exchange — DefiLlama TVL adapter (Monad)
 *
 * Fully on-chain perpetual DEX. TVL is AUSD collateral sitting in:
 *   1. The liquidity vault (AMM backstop / LP capital)
 *   2. Isolated and cross-margin Portfolio contracts, discovered from
 *      PortfolioFactory.PortfolioCreated logs (not a hardcoded list)
 *
 * Open interest, fees, and volume are out of scope; those belong in
 * DefiLlama/dimension-adapters.
 */
const { getLogs2 } = require('../helper/cache/getLogs')

/** Collateral token counted as TVL. */
const AUSD = '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a';
/** Liquidity vault that holds AUSD used as AMM backstop. */
const VAULT = '0x8379c32A965a7Bac7289893AA3861f01dD470049';
/** Factory that emits PortfolioCreated for every margin portfolio. */
const PORTFOLIO_FACTORY = '0x991D0F1E44E590FDbCe15CfF13AAa69c8287B7f3';
/** First factory block; required by getLogs2 so historical log scans are bounded. */
const FROM_BLOCK = 86147070;

/**
 * Sums on-chain AUSD balances of the liquidity vault and every portfolio
 * created by the factory.
 *
 * @param {object} api DefiLlama sdk chain api (`api.chain` is monad)
 */
async function tvl(api) {
    const vaultBal = await api.call({
        abi: 'erc20:balanceOf',
        target: AUSD,
        params: [VAULT],
    });
    api.add(AUSD, vaultBal);

    const logs = await getLogs2({
        api,
        target: PORTFOLIO_FACTORY,
        eventAbi:
            'event PortfolioCreated(address indexed portfolio, address indexed owner, uint8 portfolioType)',
        fromBlock: FROM_BLOCK,
    });
    const portfolios = logs.map((l) => l.portfolio);

    if (portfolios.length) {
        const balances = await api.multiCall({
            abi: 'erc20:balanceOf',
            calls: portfolios.map((p) => ({ target: AUSD, params: [p] })),
        });
        balances.forEach((b) => api.add(AUSD, b));
    }
}

module.exports = {
    methodology:
        'Sums AUSD held in every isolated and cross margin Portfolio contract (enumerated via PortfolioCreated events) plus AUSD held in the liquidity vault.',
    start: 1783409183,
    monad: { tvl },
};
