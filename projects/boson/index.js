const { staking } = require("../helper/staking");
const { MaxUint256 } = require("ethers");

const {
    getVoidedOffers,
    getOffers,
    getCommits,
    getReservedRanges,
    getEncumberedFunds,
} = require("./utils");

async function tvl(api) {
  // Currently Encumbered funds. 
  // Includes all buyer commitments, seller deposits and dispute resolution fees for active exchanges for both Fixed Price and Price Discovery offers.
  // It also includes all additional commits as result of Sequential Commitments
  const tokenBalances = await getEncumberedFunds(api);

  // Listed offers with uncommitted quantity
  const voidedOffers = await getVoidedOffers(api);  
  const activeOffers = await getOffers(api, voidedOffers);

  // Ignore Price Discovery offers. Their price is unknown until commitment. Its contribution to TVL is included in `getEncumberedFunds`.
  // Work only with Fixed Price offers from here on.
  const fixedPriceOffers = activeOffers.filter((i) => i.offer?.priceType !== 1n); // priceType 1 = Price Discovery

  // Get the existing commits to avoid double counting
  const commitsByOffer = await getCommits(api);

  // Handle first the offers with upfront known quantityAvailable
  const limitedOffers = fixedPriceOffers.filter((i) => i.offer?.quantityAvailable !== MaxUint256); // MaxUint256 indicates unlimited quantityAvailable
  for (const offer of limitedOffers) {
    const offerId = BigInt(offer.offerId);
    // Uncommitted quantity is total quantityAvailable minus already committed quantity
    // No need to check for reserved ranges since they do not affect the quantityAvailable
    const uncommittedQuantity = BigInt(offer.offer.quantityAvailable) - BigInt(commitsByOffer[offerId]?.length || 0);

    addUncommittedQuantityToTokenBalances(offer, uncommittedQuantity, tokenBalances);
  }

  // Handle the offers with unlimited quantityAvailable
  // Their uncommitted quantity is determined by the reserved range minus the number of commits that fall within its reserved range
  // If there are any additional commits outside the reserved range, belonging to the same offer, they are included in TVL in `getEncumberedFunds` already
  const unlimitedOffers = fixedPriceOffers.filter((i) => i.offer?.quantityAvailable === MaxUint256);
  const reservedRanges = await getReservedRanges(api);
  for (const offer of unlimitedOffers) {
    const offerId = BigInt(offer.offerId);
    const reservedRange = reservedRanges[offerId];
    if (reservedRange) {
      const { startExchangeId, endExchangeId } = reservedRange;
      // Check if any of the commits fall within the reserved range
      // Range is inclusive of both startExchangeId and endExchangeId
      const commitsInRange =
        commitsByOffer[offerId]?.filter((exchangeId) => {
          const exId = BigInt(exchangeId);
          return exId >= startExchangeId && exId <= endExchangeId;
        }).length || 0n;
      const uncommittedQuantity = endExchangeId - startExchangeId + 1n - commitsInRange;

      addUncommittedQuantityToTokenBalances(offer, uncommittedQuantity, tokenBalances);
    }
  }

  api.addTokens(Object.keys(tokenBalances), Object.values(tokenBalances));
}

function addUncommittedQuantityToTokenBalances(offer, uncommittedQuantity, tokenBalances) {
  const exchangeToken = offer.offer.exchangeToken;
  const price = BigInt(offer.offer.price);
  const sellerDeposit = BigInt(offer.offer.sellerDeposit);
  const drFeeAmount = BigInt(offer.disputeResolutionTerms.feeAmount);
  const lockedPerExchange = price + sellerDeposit + drFeeAmount;
  const totalLocked = lockedPerExchange * uncommittedQuantity;

  tokenBalances[exchangeToken] = (tokenBalances[exchangeToken] || 0n) + totalLocked;
}

module.exports = {
  ethereum: {
    tvl,
    staking: staking(
      [
        "0x6244bc0d4b661526c0c62c3610571cd1ac9df2dd",
        "0xbacc083795846a67b0782327a96622447ddafe6c",
        "0x081a52f02e51978ad419dd7894d7ae3555f8bc26",
        "0x3ed0c99c8e8eb94438837cc8a08ca3bb187424cf",
        "0x3810d9d6685812af6ef4257de0542ecdba9bfd95",
        "0xdDFa9c32CC6Aa3a53cC681fb6f4A65b255324BD3"
      ],
      "0xC477D038d5420C6A9e0b031712f61c5120090de9"
    ),
  },
  polygon: {
    tvl,
  },
  base: {
    tvl,
  },
  optimism: {
    tvl,
  },
  arbitrum: {
    tvl,
  },
};
