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
      const tokenAmount = parseInt(amount) / 1e6;
      if (denom === "uusd") {
        balances["terrausd"] += tokenAmount;
      } else {
        /**
         * 3/10/2022 - Risk Harbor Ozone currently only supports depositing UST (returned as uusd denominator by Terra API)
         * so this code should not be executed. This is an attempt at future proofing in the event the Terra contract holds other
         * assets than UST, though it could fail if the Terra API denomination name doesn't align with Coingecko id for the asset
         */
        balances[denom] = (balances[denom] ?? 0) + tokenAmount;
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
