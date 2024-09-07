const { sumTokens2 } = require("../helper/unwrapLPs");
const { getLogs } = require("../helper/cache/getLogs");

const RUMPEL_WALLET_FACTORY = "0x5774abcf415f34592514698eb075051e97db2937";
const RUMEPL_WALLET_FACTORY_DEPLOYED_BLOCK = 20696108;

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: RUMPEL_WALLET_FACTORY,
    topic: "SafeCreated(address,address[],uint256)",
    eventAbi:
      "event SafeCreated(address indexed safe, address[] indexed owners, uint256 threshold)",
    fromBlock: RUMEPL_WALLET_FACTORY_DEPLOYED_BLOCK,
  });

  const owners = logs.map((log) => log.args[0]);

  return sumTokens2({
    owners,
    fetchCoValentTokens: true,
  });
}

module.exports = {
  ethereum: {
    tvl,
  },
};
