const {
    sumTokens2,
    getTokenSupplies,
    getAssociatedTokenAddress,
    getProvider,
    getConnection
} = require('../helper/solana');
const ADDRESSES = require('../helper/coreAssets.json')
const {PublicKey} = require('@solana/web3.js')
const {BN, Program} = require('@coral-xyz/anchor');
const {default: axios} = require('axios')
const {BigNumber} = require('bignumber.js')
const { getLowestOfferPrice, getOfferTokenAccounts, calculateSellTokenPerBuyTokenNow, calculateBuyTokenPerSellTokenNow } = require('./offerUtils');


const MINT = '5Y8NV33Vv7WbnLfq3zBcKSdYPrk7g2KoiQoe7M2tcxp5';
const BOSS = '45YnzauhsBM8CpUz96Djf8UG5vqq2Dua62wuW9H3jaJ5';
const programId = new PublicKey('onreuGhHHgVzMWSkj2oQDLDtvvGvoepBPkqyaubFcwe');
const onreOffchain = 'https://onre-api-dev.ew.r.appspot.com/offers';


async function tvl(api) {
    // --- Dynamic offers implementation ---
    // const offers = (await axios.get(onreOffchain)).data;
    // if (!Array.isArray(offers) || offers.length === 0) {
    //     throw new Error('No offers returned from endpoint');
    // }
    //
    // const lowestPrice = getLowestOfferPrice(offers, ADDRESSES.solana.USDC);
    // const allTokenAccounts = getOfferTokenAccounts(offers, MINT, programId);
    // const bossTokenAccount = getAssociatedTokenAddress(MINT, BOSS);
    // allTokenAccounts.push(bossTokenAccount);
    //
    // const bossAndOffers = await sumTokens2({
    //     tokenAccounts: allTokenAccounts,
    // });
    // const tokenSupply = await getTokenSupplies([MINT]);
    // const circulatingSupply = +tokenSupply[MINT] - (+bossAndOffers[`solana:${MINT}`]);
    // api.add(ADDRESSES.solana.USDC, BigInt(circulatingSupply) * BigInt(lowestPrice) / BigInt(1e9));

    // --- Original static offer implementation (kept for reference) ---
    const offerId = new BN(1);
    const [offerAuthority] = PublicKey.findProgramAddressSync([
        Buffer.from('offer_authority'), offerId.toArrayLike(Buffer, 'le', 8)
    ], programId);

    const offer = {
        sellTokenStartAmount: BigInt('201525740000'),
        sellTokenEndAmount: BigInt('201525740000'),
        buyToken1Amount: BigInt('200000000000000'),
        startDate: new Date('2025-05-10T00:00:00Z'),
        endDate: new Date('2025-05-25T00:00:00Z'),
        sellToken: ADDRESSES.solana.USDC,
        buyToken1: MINT
    }
    const price = offer.sellToken === ADDRESSES.solana.USDC ? calculateSellTokenPerBuyTokenNow(offer) : calculateBuyTokenPerSellTokenNow(offer);

    const offerTokenAccount = getAssociatedTokenAddress(MINT, offerAuthority.toBase58())
    const bossTokenAccount = getAssociatedTokenAddress(MINT, BOSS)

    console.log(offerAuthority.toBase58())
    const bossAndOffers = await sumTokens2({
        tokenAccounts: [offerTokenAccount, bossTokenAccount],
    });
    const tokenSupply = await getTokenSupplies([MINT]);
    const circulatingSupply = +tokenSupply[MINT] - (+bossAndOffers[`solana:${MINT}`])
    api.add(ADDRESSES.solana.USDC, BigInt(circulatingSupply) * BigInt(price) / BigInt(1e9))
}

module.exports = {
    timetravel: false,
    solana: {tvl},
} 