const ADDRESSES = require('../helper/coreAssets.json')
const { queryAddresses, sumTokens } = require("../helper/chain/radixdlt");

const FLUX_COMPONENT =
  "component_rdx1czgv2hx5lq4v5tjm32u69s5dw8ja0d4qeau2y5vktvaxlrmsfdy08u";
const LSU_POOL =
  "component_rdx1cppy08xgra5tv5melsjtj79c0ngvrlmzl8hhs7vwtzknp9xxs63mfp";
const LSU_LP =
  "resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf";

async function tvl(api) {
  //get the token amounts of collaterals used in the STAB Protocol
  const fluxTokens = await sumTokens({ owners: [FLUX_COMPONENT], api });

  //Flux contains XRD and LSULP. sumTokens automatically api.add()s these, but LSULP is not priced, so we need to add it manually.
  //First we get the LSULP amount.
  const lsuLpAmount =
    fluxTokens[
      "radixdlt:resource_rdx1thksg5ng70g9mmy9ne7wz0sc7auzrrwy7fmgcxzel2gvp8pj0xxfmf"
    ];

  //LSULP is a pool of staked XRD, so the value of LSULP can be denominated in XRD.
  //We calculate the value of 1 LSULP by getting the total value of the pool in XRD, and dividing by the total supply of LSULP.
  const items = await queryAddresses({ addresses: [LSU_LP, LSU_POOL] });

  const lsuLpItem = items.find((item) => item.address === LSU_LP);
  const lsuPoolItem = items.find((item) => item.address === LSU_POOL);

  const totalLsulpSupply = lsuLpItem.details.total_supply;
  const lsuPoolXrdValue = lsuPoolItem.details.state.fields[4].value;

  //calculate the value of 1 LSULP in XRD
  const lsuLpMultiplier = lsuPoolXrdValue / totalLsulpSupply;

  //add LSULP value to tvl
  api.add(
    ADDRESSES.radixdlt.XRD,
    lsuLpAmount * lsuLpMultiplier
  );

  //as said previously, sumTokens automatically performs api.add(), so we subtract the LSULP amount to be sure.
  //This is not strictly necessary right now, as LSULP is not priced by DefiLlama,
  //but if it were priced, it would be counted twice without subtracting here.
  api.add(LSU_LP, -1 * lsuLpAmount);
}

module.exports = {
  methodology:
    "Calculates TVL using the amount of collateral locked to borrow fUSD using CDPs (Flux Generators). Does not count fUSD locked in Stability Pools (Flux Reservoirs).",
  radixdlt: { tvl },
  misrepresentedTokens: true,
  timetravel: false,
};
