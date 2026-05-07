const { staking } = require("../helper/staking");

const {
  getVoidedOffers,
  getOffers,
  getCommits,
  getDepositedAndEncumberedBalances,
} = require("./utils");

async function tvl(api) {
  // Currently Deposited and Encumbered funds.
  // Includes all buyer commitments, seller deposits and dispute resolution fees for active exchanges for both Fixed Price and Price Discovery offers.
  // It also includes all additional commits as result of Sequential Commitments
  await getDepositedAndEncumberedBalances(api);

  // Listed offers with uncommitted quantity
  const voidedOffers = await getVoidedOffers(api);
  const activeOffers = await getOffers(api, voidedOffers);

  // Ignore Price Discovery offers. Their price is unknown until commitment. Its contribution to TVL is included in `getEncumberedFunds`.
  // Work only with Fixed Price offers from here on.
  const fixedPriceOffers = activeOffers.filter(
    (i) => i.offer?.priceType !== 1n
  ); // priceType 1 = Price Discovery

  // Get the existing commits to avoid double counting
  const commitsByOffer = await getCommits(api);

  const tokenBalances = {};
  for (const offer of fixedPriceOffers) {
    const offerId = BigInt(offer.offerId);

    // Calculate the remaining uncommitted quantity
    const uncommittedQuantity =
      BigInt(offer.offer.quantityAvailable) -
      BigInt(commitsByOffer[offerId]?.length || 0);

    if (uncommittedQuantity > 0n) {
      // continue; // Skip offers with uncommitted quantity
      const exchangeToken = offer.offer.exchangeToken;
      const price = BigInt(offer.offer.price);

      // Use only a single price (ignore quantity) to avoid TVL inflation
      // When buyers are committing, the TVL will increase accordingly
      tokenBalances[exchangeToken] =
        (tokenBalances[exchangeToken] || 0n) + price;
    }
  }

  api.addTokens(Object.keys(tokenBalances), Object.values(tokenBalances));
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
        "0xdDFa9c32CC6Aa3a53cC681fb6f4A65b255324BD3",
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
