//@ts-check

const { getAddressDecoder } = require("@solana/addresses");
const { getBase64Encoder } = require("@solana/codecs");

const { getRpc, getTokenBalances } = require("./utils");

/**
 * @template {string} [TAddress=string]
 * @typedef {import("@solana/addresses").Address<TAddress>} Address
 */

const programId = /** @type {Address} */("D8vMVKonxkbBtAXAxBwPPWyTfon8337ARJmHvwtsF98G"); /* prettier-ignore */

async function tvl() {
  const rpc = getRpc();

  const result = await rpc
    .getProgramAccounts(programId, {
      encoding: "base64",
      // We only care about market collateral address (136..168).
      dataSlice: { offset: 136, length: 32 },
      filters: [
        // Market accounts have a discriminator of [219, 190, 213, 55, 0, 227, 198, 154] at offset 0.
        { memcmp: { offset: 0n, bytes: "dkokXHR3DTw", encoding: "base58" } },
      ],
    })
    .send();

  const base64Encoder = getBase64Encoder();

  const addressDecoder = getAddressDecoder();

  const collateralAccounts = result.map(({ account }) => {
    const data = base64Encoder.encode(account.data[0]);

    // Market collateral address is at offset 136 + 0.
    return addressDecoder.decode(data, 0);
  });

  const deposits = await getTokenBalances(collateralAccounts);

  return deposits;
}

module.exports = tvl;
