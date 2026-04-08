const { function_view } = require("../helper/chain/aptos");

const MODULE = "lotto_run";
const APT = "0x1::aptos_coin::AptosCoin";

const POOLS = [
  "0xc38c49cd3008de7e0f41aadd83155ba1e4e380694db1e48b1f13c404e2451f16",
  "0x2ee2377b4b358cdf272cb7f3e8d22525c9d42a7db64816605f10f12819421c37",
  "0x53d1c36ff2af28bf67df3b1b2d2229e6bdf307efd6cacacdff8b4e2c2e1aace8",
  "0x55a51900d3c7bf85347c260448f7e5ffca9f37bbe8157679dbcb274967fae421",
];

async function tvl(api) {
  for (const pool of POOLS) {
    // pool_info returns [pool_size, label, current_round, total_draws]
    const poolInfo = await function_view({
      functionStr: `${pool}::${MODULE}::pool_info`,
      args: [pool],
    });
    const currentRound = poolInfo[2];

    // round_state returns [status, sold, pool_size, pot]
    const roundState = await function_view({
      functionStr: `${pool}::${MODULE}::round_state`,
      args: [pool, currentRound],
    });
    const pot = roundState[3]; // in octas (1e8)

    api.add(APT, pot);
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the sum of APT locked in the active lottery round vaults across the 4 immutable Aptos pool contracts.",
  aptos: { tvl },
};
