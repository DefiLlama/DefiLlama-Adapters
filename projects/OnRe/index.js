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
    // // Calculate price for each offer and find the lowest
    // let lowestPrice = null;
    // for (const offer of offers) {
    //     offer.sellTokenStartAmount = BigInt(offer.sellTokenStartAmount);
    //     offer.sellTokenEndAmount = BigInt(offer.sellTokenEndAmount);
    //     offer.buyToken1Amount = BigInt(offer.buyToken1Amount);
    //     offer.startDate = new Date(offer.startDate);
    //     offer.endDate = new Date(offer.endDate);
    //     let price;
    //     const price = offer.sellToken === ADDRESSES.solana.USDC ? calculateSellTokenPerBuyTokenNow(offer) : calculateBuyTokenPerSellTokenNow(offer);
    //
    //     if (lowestPrice === null || price < lowestPrice) {
    //         lowestPrice = price;
    //     }
    // }
    // if (lowestPrice === null) {
    //     throw new Error('No valid offers found for current time');
    // }
    // console.log('Lowest price', lowestPrice.toString());
    //
    // // Derive token accounts for all offers
    // const offerTokenAccounts = offers.map(offer => {
    //     const offerId = new BN(offer.id);
    //     const [offerAuthority] = PublicKey.findProgramAddressSync([
    //         Buffer.from('offer_authority'),
    //         offerId.toArrayLike(Buffer, 'le', 8)
    //     ], programId);
    //     return getAssociatedTokenAddress(MINT, offerAuthority.toBase58());
    // });
    // const bossTokenAccount = getAssociatedTokenAddress(MINT, BOSS);
    // const allTokenAccounts = [...offerTokenAccounts, bossTokenAccount];
    //
    // const bossAndOffers = await sumTokens2({
    //     tokenAccounts: allTokenAccounts,
    // });
    // const tokenSupply = await getTokenSupplies([MINT]);
    // const circulatingSupply = +tokenSupply[MINT] - (+bossAndOffers[`solana:${MINT}`]);
    // console.log(circulatingSupply / 1e9);
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

function calculateSellTokenPerBuyTokenNow(offer, now = new Date()) {
    const start = new Date(offer.startDate).getTime() / 1000;
    const end = new Date(offer.endDate).getTime() / 1000;
    const current = BigInt(Math.floor(now.getTime() / 1000));

    if (current < BigInt(start) || current > BigInt(end)) {
        throw new Error("Current time is outside offer bounds");
    }

    // total time in seconds
    const intervals = BigInt(end - start)
    const currentInterval = current - BigInt(start)

    const totalChange = offer.sellTokenEndAmount - offer.sellTokenStartAmount;
    const changePerInterval = totalChange / intervals;

    const currentSellAmount = offer.sellTokenStartAmount + changePerInterval * (currentInterval + BigInt(1));

    return currentSellAmount * BigInt(1e9) / offer.buyToken1Amount;
}

function calculateBuyTokenPerSellTokenNow(offer, now = new Date()) {
    const start = new Date(offer.startDate).getTime() / 1000;
    const end = new Date(offer.endDate).getTime() / 1000;
    const current = BigInt(Math.floor(now.getTime() / 1000));

    if (current < BigInt(start) || current > BigInt(end)) {
        throw new Error("Current time is outside offer bounds");
    }

    const intervals = BigInt(end - start);
    const currentInterval = current - BigInt(start);

    const totalChange = offer.sellTokenEndAmount - offer.sellTokenStartAmount;
    const changePerInterval = totalChange / intervals;

    const currentSellAmount = offer.sellTokenStartAmount + changePerInterval * (currentInterval + BigInt(1));

    // This time: 1 sell token gives how many buy tokens (scaled by 1e9)
    return offer.buyToken1Amount * (BigInt(1e9)) / currentSellAmount;
}

module.exports = {
    timetravel: false,
    solana: {tvl},
} 