const ADDRESSES = require('../helper/coreAssets.json')

/** Liquidity vault that holds AUSD used as AMM backstop. */
const VAULT = '0x8379c32A965a7Bac7289893AA3861f01dD470049';
/** Factory that deploys every margin portfolio. */
const PORTFOLIO_FACTORY = '0x991D0F1E44E590FDbCe15CfF13AAa69c8287B7f3';

async function tvl(api) {
    const portfolios = (
        await api.fetchList({
            target: PORTFOLIO_FACTORY,
            lengthAbi: 'uint256:nextPortfolioId',
            itemAbi: 'function getPortfolioById(uint256) view returns (address)',
            startFromOne: true,
        })
    ).filter((addr) => addr !== ADDRESSES.null);

    return api.sumTokens({
        tokens: [ADDRESSES.monad.AUSD],
        owners: [VAULT, ...portfolios],
    });
}

module.exports = {
    methodology: 'Sums AUSD held in every isolated and cross margin Portfolio contract (enumerated via PortfolioFactory.getPortfolioById) plus AUSD held in the liquidity vault.',
    start: '2026-07-07',
    monad: { tvl },
};