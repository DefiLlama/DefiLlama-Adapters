const { sumTokens2, getTokenSupplies, getAssociatedTokenAddress } = require('../helper/solana');
const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js')
const { getLowestOfferPrice, getOfferTokenAccounts } = require('./offerUtils');
const { getConfig } = require('../helper/cache');

const MINT = '5Y8NV33Vv7WbnLfq3zBcKSdYPrk7g2KoiQoe7M2tcxp5';
const BOSS = '45YnzauhsBM8CpUz96Djf8UG5vqq2Dua62wuW9H3jaJ5';
const programId = new PublicKey('onreuGhHHgVzMWSkj2oQDLDtvvGvoepBPkqyaubFcwe');
const onreOffchain = 'https://onre-api-prod.ew.r.appspot.com/offers';

async function tvl(api) {
    const offers = await getConfig('onre/offers', onreOffchain);

    let lowestPrice = getLowestOfferPrice(offers, ADDRESSES.solana.USDC);
    if (typeof lowestPrice !== "bigint" || lowestPrice <= 0n) lowestPrice = 1_000_000n;
    const allTokenAccounts = getOfferTokenAccounts(offers, MINT, programId);
    const bossTokenAccount = getAssociatedTokenAddress(MINT, BOSS);
    allTokenAccounts.push(bossTokenAccount);

    const bossAndOffers = await sumTokens2({ tokenAccounts: allTokenAccounts });
    const tokenSupply = await getTokenSupplies([MINT]);

    const circulatingSupply =BigInt(+tokenSupply[MINT] - (+bossAndOffers[`solana:${MINT}`] || 0));
    api.add(ADDRESSES.solana.USDC, circulatingSupply * lowestPrice / 1_000_000_000n);
}

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    solana: {tvl},
} 