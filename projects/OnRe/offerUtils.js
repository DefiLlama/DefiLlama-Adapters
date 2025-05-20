const { BN } = require('@coral-xyz/anchor');
const { PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress } = require('../helper/solana');

function calculateSellTokenPerBuyTokenNow(offer, now = new Date()) {
    const start = new Date(offer.startDate).getTime() / 1000;
    const end = new Date(offer.endDate).getTime() / 1000;
    const current = BigInt(Math.floor(now.getTime() / 1000));
    if (current < BigInt(start) || current > BigInt(end)) {
        throw new Error('Current time is outside offer bounds');
    }
    const intervals = BigInt(end - start);
    const currentInterval = current - BigInt(start);
    const totalChange = offer.sellTokenEndAmount - offer.sellTokenStartAmount;
    const changePerInterval = totalChange / intervals;
    const currentSellAmount = offer.sellTokenStartAmount + changePerInterval * (currentInterval);
    return currentSellAmount * BigInt(1e9) / offer.buyToken1Amount;
}

function calculateBuyTokenPerSellTokenNow(offer, now = new Date()) {
    const start = new Date(offer.startDate).getTime() / 1000;
    const end = new Date(offer.endDate).getTime() / 1000;
    const current = BigInt(Math.floor(now.getTime() / 1000));
    if (current < BigInt(start) || current > BigInt(end)) {
        throw new Error('Current time is outside offer bounds');
    }
    const intervals = BigInt(end - start);
    const currentInterval = current - BigInt(start);
    const totalChange = offer.sellTokenEndAmount - offer.sellTokenStartAmount;
    const changePerInterval = totalChange / intervals;
    const currentSellAmount = offer.sellTokenStartAmount + changePerInterval * (currentInterval + BigInt(1));
    return offer.buyToken1Amount * BigInt(1e9) / currentSellAmount;
}

function getLowestOfferPrice(offers, usdcAddress) {
    if (!Array.isArray(offers) || offers.length === 0) {
        // Return 1 with 6 decimals as BigInt
        return BigInt(1_000_000);
    }
    let lowestPrice = null;
    for (const offer of offers) {
        offer.sellTokenStartAmount = BigInt(offer.sellTokenStartAmount);
        offer.sellTokenEndAmount = BigInt(offer.sellTokenEndAmount);
        offer.buyToken1Amount = BigInt(offer.buyToken1Amount);
        offer.startDate = new Date(offer.startDate);
        offer.endDate = new Date(offer.endDate);
        let price;
        if (offer.sellToken === usdcAddress) {
            price = calculateSellTokenPerBuyTokenNow(offer);
        } else {
            price = calculateBuyTokenPerSellTokenNow(offer);
        }
        if (lowestPrice === null || price < lowestPrice) {
            lowestPrice = price;
        }
    }
    if (lowestPrice === null) {
        return BigInt(1_000_000);
    }
    return lowestPrice;
}

function getOfferTokenAccounts(offers, mint, programId) {
    return offers.map(offer => {
        const offerId = new BN(offer.id);
        const [offerAuthority] = PublicKey.findProgramAddressSync([
            Buffer.from('offer_authority'),
            offerId.toArrayLike(Buffer, 'le', 8)
        ], programId);
        return getAssociatedTokenAddress(mint, offerAuthority.toBase58());
    });
}

module.exports = {
    getLowestOfferPrice,
    getOfferTokenAccounts,
    calculateSellTokenPerBuyTokenNow,
    calculateBuyTokenPerSellTokenNow,
}; 