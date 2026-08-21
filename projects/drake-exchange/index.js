/**
 * Drake Exchange — DefiLlama TVL adapter (Monad)
 *
 * Fully on-chain perpetual DEX. TVL is AUSD collateral sitting in:
 *   1. The liquidity vault (AMM backstop / LP capital)
 *   2. Isolated and cross-margin Portfolio contracts, enumerated via
 *      PortfolioFactory.nextPortfolioId / getPortfolioById (eth_call only)
 *
 * Open interest, fees, and volume are out of scope; those belong in
 * DefiLlama/dimension-adapters.
 */
const { nullAddress } = require('../helper/tokenMapping')

/** Collateral token counted as TVL. */
const AUSD = '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a';
/** Liquidity vault that holds AUSD used as AMM backstop. */
const VAULT = '0x8379c32A965a7Bac7289893AA3861f01dD470049';
/** Factory that deploys every margin portfolio. */
const PORTFOLIO_FACTORY = '0x991D0F1E44E590FDbCe15CfF13AAa69c8287B7f3';

/**
 * Sums on-chain AUSD balances of the liquidity vault and every portfolio
 * created by the factory.
 *
 * @param {object} api DefiLlama sdk chain api (`api.chain` is monad)
 */
async function tvl(api) {
    const portfolios = (
        await api.fetchList({
            target: PORTFOLIO_FACTORY,
            lengthAbi: 'uint256:nextPortfolioId',
            itemAbi: 'function getPortfolioById(uint256) view returns (address)',
            startFromOne: true,
        })
    ).filter((addr) => addr !== nullAddress);

    return api.sumTokens({
        tokens: [AUSD],
        owners: [VAULT, ...portfolios],
    });
}

module.exports = {
    methodology:
        'Sums AUSD held in every isolated and cross margin Portfolio contract (enumerated via PortfolioFactory.getPortfolioById) plus AUSD held in the liquidity vault.',
    start: 1783409183,
    monad: { tvl },
};
