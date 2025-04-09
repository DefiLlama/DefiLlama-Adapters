const { function_view } = require("../helper/chain/aptos");

const MIRAGE_MOVEMENT =
  "0x24d6dcce95555b8e8eeaed7d739ea1036c0b8d4bbc6a01797505295a56d322cc";

const MOVEMENT_MOVE_MUSD_POOL = "0x81821b61b14a7899e6417c9f9b6a2a8871d6d27a2fc66fee97942425185d546f";

async function tvl(api) {
  const resp = await function_view({
    functionStr: `${MIRAGE_MOVEMENT}::vault::total_collateral`,
    args: [MOVEMENT_MOVE_MUSD_POOL],
    chain: 'move'
  })
  api.add("0xa", resp)
}

module.exports = {
  timetravel: false,
  move: { tvl },
};

