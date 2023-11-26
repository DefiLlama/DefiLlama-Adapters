const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");

const ETH_ADDRESS = ADDRESSES.null;
// TroveManager holds total system collateral (deposited ETH)
const TROVE_MANAGER_ADDRESS = {
  "linea": "0xE06F4754e94E2b6A462E616Ca3Ec78c6f4674A61",
  "neon_evm": "0x24c36094aB3C4Ca62252d3bFA47599E668187669",
};
const abi = "uint256:getEntireSystemColl";

async function tvl(_, block, _2, { api }) {
  const target = TROVE_MANAGER_ADDRESS[api.chain];
  const troveEthTvl = (
    await api.call({
      target,
      abi,
      block,
    })
  );
  console.log(troveEthTvl)
  return {
    [ETH_ADDRESS]: Number(troveEthTvl),
  };
}

module.exports = {
  start: 1700000000, // Tuesday, November 14, 2023 10:13:20 PM
  linea: {
    tvl,
  },
  neon_evm: {
    tvl,
  },
};
