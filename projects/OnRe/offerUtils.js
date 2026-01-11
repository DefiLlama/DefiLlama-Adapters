const { BN } = require('@coral-xyz/anchor');
const { PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress } = require('../helper/solana');

const safeBigInt = (v) => v === undefined || v === null || v === '' || isNaN(v) ? null : BigInt(v);

const safeDate = (d) => {
  const t = new Date(d).getTime();
  return isNaN(t) ? null : t / 1000;
};

function calculateSellTokenPerBuyTokenNow(offer, now = new Date()) {
  const start = safeDate(offer.startDate);
  const end = safeDate(offer.endDate);

  if (start === null || end === null || end <= start) return null;

  const current = BigInt(Math.floor(now.getTime() / 1000));
  if (current < BigInt(start) || current > BigInt(end)) return null;

  const intervals = BigInt(end - start);
  const totalChange = offer.sellTokenEndAmount - offer.sellTokenStartAmount;

  if (intervals === 0n) return null;

  const changePerInterval = totalChange / intervals;
  const currentInterval = current - BigInt(start);

  const currentSellAmount = offer.sellTokenStartAmount + changePerInterval * currentInterval;

  if (offer.buyToken1Amount === 0n) return null;

  return (currentSellAmount * 1_000_000_000n) / offer.buyToken1Amount;
}

function calculateBuyTokenPerSellTokenNow(offer, now = new Date()) {
  const start = safeDate(offer.startDate);
  const end = safeDate(offer.endDate);

  if (start === null || end === null || end <= start) return null;

  const current = BigInt(Math.floor(now.getTime() / 1000));
  if (current < BigInt(start) || current > BigInt(end)) return null;

  const intervals = BigInt(end - start);
  const totalChange = offer.sellTokenEndAmount - offer.sellTokenStartAmount;

  if (intervals === 0n) return null;

  const changePerInterval = totalChange / intervals;
  const currentInterval = current - BigInt(start);

  const currentSellAmount = offer.sellTokenStartAmount + changePerInterval * (currentInterval + 1n);

  if (currentSellAmount === 0n) return null;

  return (offer.buyToken1Amount * 1_000_000_000n) / currentSellAmount;
}

function getLowestOfferPrice(offers, usdcAddress) {
  if (!Array.isArray(offers) || offers.length === 0) return 1_000_000n; // fallback

  let lowestPrice = null;

  for (const offer of offers) {
    const startAmount = safeBigInt(offer.sellTokenStartAmount);
    const endAmount = safeBigInt(offer.sellTokenEndAmount);
    const buyAmount = safeBigInt(offer.buyToken1Amount);

    if (startAmount === null || endAmount === null || buyAmount === null) continue;

    offer.sellTokenStartAmount = startAmount;
    offer.sellTokenEndAmount = endAmount;
    offer.buyToken1Amount = buyAmount;

    const price = offer.sellToken === usdcAddress ? calculateSellTokenPerBuyTokenNow(offer) : calculateBuyTokenPerSellTokenNow(offer);
    if (price === null) continue;
    if (lowestPrice === null || price < lowestPrice) lowestPrice = price;
  }

  return lowestPrice ?? 1_000_000n;
}

function getOfferTokenAccounts(offers, mint, programId) {
  const accounts = [];

  for (const offer of offers) {
    const id = safeBigInt(offer.id);
    if (id === null) continue;

    const idBN = new BN(id.toString());
    const [offerAuthority] = PublicKey.findProgramAddressSync([Buffer.from('offer_authority'), idBN.toArrayLike(Buffer, 'le', 8)], programId);

    accounts.push(getAssociatedTokenAddress(mint, offerAuthority.toBase58()));
  }

  return accounts;
}

module.exports = {
  getLowestOfferPrice,
  getOfferTokenAccounts,
  calculateSellTokenPerBuyTokenNow,
  calculateBuyTokenPerSellTokenNow,
};
