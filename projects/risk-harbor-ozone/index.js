const { queryV1Beta1 } = require("../helper/terra");
const { getBlock } = require("../helper/getBlock");

const riskHarborOzoneAddress = "terra1dlfz2teqt5shxuw87npfecjtv7xlrxvqd4sapt";

async function getTvl(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, "terra", chainBlocks);
  const balances = { terrausd: 0 };
  let paginationKey;

  do {
    const data = await queryV1Beta1(
      `bank/v1beta1/balances/${riskHarborOzoneAddress}`,
      paginationKey,
      block
    );

    paginationKey = data.pagination.next_key;

    data.balances.forEach(({ denom, amount }) => {
      /**
       * 3/10/2022 - As of now the only supported underwriting token for Risk Harbor Ozone is UST, so
       * balances should always be an array of length 1. Added support for dynamic balances length, denom checking, and pagination for
       * future proofing and safety.
       */
      if (denom === "uusd") {
        balances["terrausd"] += parseInt(amount) / 1e6;
      }
    });
  } while (paginationKey);

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Amount of underwriter capital inside the protocol",
  start: 5877549,
  tvl: getTvl,
};
