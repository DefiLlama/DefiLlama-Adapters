const { getLogs } = require("../helper/cache/getLogs");
const { nullAddress } = require("../helper/unwrapLPs");

const ALP_TOKEN = "0xb49B6A3Fd1F4bB510Ef776de7A88A9e65904478A";
const GMLP_ORACLE = "0x4997916792decbF5DAcbaFc47CF2071AD9Fe6456";
const GMLP_TOKEN = "0xc16ce97d04de6c5e0391e308dbc17a397183067b";
const getAmountAcrossStrategies = "function getAmountAcrossStrategies(address coin) view returns (uint256)";

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: ALP_TOKEN,
    eventAbi: "event SetCoinCap(address indexed coin, uint256 indexed cap)",
    onlyArgs: true,
    fromBlock: 67635825,
  });

  const gmlpTargets = await api.call({ target: GMLP_ORACLE, abi: "function getTargets() view returns (tuple(address coin, uint256 weight)[])", });

  const alpTokens = logs.map((l) => l.coin);
  const gmlpTokens = gmlpTargets.map((l) => l.coin);
  const bals = await api.multiCall({ target: ALP_TOKEN, abi: getAmountAcrossStrategies, calls: alpTokens })
  const gmlpBals = await api.multiCall({ target: GMLP_TOKEN, abi: getAmountAcrossStrategies, calls: gmlpTokens })
  api.addTokens(alpTokens, bals)
  api.addTokens(gmlpTokens, gmlpBals)

  return api.sumTokens(({ owners: [ALP_TOKEN, GMLP_TOKEN], tokens: [nullAddress] }))
}

module.exports = {
  arbitrum: {
    tvl,
  },
};