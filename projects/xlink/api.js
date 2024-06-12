const { call } = require("../helper/chain/stacks-api");

module.exports = {
  timetravel: false,
  stacks: { tvl },
};

async function tvl() {
  const owners = [
    "SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.cross-bridge-registry-v2-01",
    "SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.btc-peg-out-endpoint-v2-01",
  ];
  let lqstx = 0;
  let abtc = 0;
  let alex = 0;
  for (const owner of owners) {
    lqstx += Number(
      (
        await call({
          target: "SM26NBC8SFHNW4P1Y4DFH27974P56WN86C92HPEHH.token-vlqstx",
          abi: "get-share",
          inputArgs: [{ type: "principal", value: owner }],
        })
      ).value
    );
    abtc += Number(
      (
        await call({
          target: "SP2XD7417HGPRTREMKF748VNEQPDRR0RMANB7X1NK.token-abtc",
          abi: "get-balance",
          inputArgs: [{ type: "principal", value: owner }],
        })
      ).value
    );
    alex += Number(
      (
        await call({
          target: "SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM.token-alex",
          abi: "get-balance",
          inputArgs: [{ type: "principal", value: owner }],
        })
      ).value
    );
  }

  return {
    blockstack: lqstx / 1e6,
    bitcoin: abtc / 1e8,
    alexgo: alex / 1e8,
  };
}
