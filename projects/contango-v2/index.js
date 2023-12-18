const { getLogs } = require("../helper/cache/getLogs");

const CONTANGO_PROXY = "0x6Cae28b3D09D8f8Fc74ccD496AC986FC84C0C24E";

const config = {
  arbitrum: {
    contango: CONTANGO_PROXY,
    fromBlock: 120103720,
    grapUrl: "https://api.thegraph.com/subgraphs/name/contango-xyz/v2-arbitrum",
  },
};

Object.keys(config).forEach((chain) => {
  const { contango, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (_1, _2, _3, { api }) => vaultTvl(api, contango, fromBlock),
  };
});

async function vaultTvl(api, contango, fromBlock) {
  const logs = await getLogs({
    api,
    target: contango,
    eventAbi: abis.InstrumentCreated,
    onlyArgs: true,
    fromBlock,
  });
  const vault = await api.call({ abi: "address:vault", target: contango });
  return api.sumTokens({
    owner: vault,
    tokens: logs.flatMap((log) => [log.base, log.quote]),
  });
}

const abis = {
  InstrumentCreated:
    "event InstrumentCreated(bytes16 indexed symbol, address base, address quote)",
};
