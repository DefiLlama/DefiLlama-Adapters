const { sumTokens2 } = require("../helper/unwrapLPs");

const v2Deposits = "0xC3EcaDB7a5faB07c72af6BcFbD588b7818c4a40e";
const v3Deposits = "0xc28EffdfEF75448243c1d9bA972b97e32dF60d06";

async function tvl(_, __, ___, { api }) {
  const usdbWethV2 = "0x12c69bfa3fb3cba75a1defa6e976b87e233fc7df";

  const v2Bals = await api.multiCall({
    abi: "function balanceOf(address) view returns (uint256)",
    calls: [{ params: v2Deposits }],
    target: usdbWethV2,
  });

  api.add([usdbWethV2], v2Bals);

  await sumTokens2({
    api,
    resolveUniV3: true,
    resolveLP: true,
    unwrapAll: true,
    resolveLP: true,
    owners: [v2Deposits, v3Deposits],
  });
}

// https://docs.hyperlock.finance/developers/hyperlock-contracts
module.exports = {
  doublecounted: true,
  blast: {
    tvl,
  },
};
