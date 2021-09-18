const sdk = require("@defillama/sdk");
const { calculateUniTvl } = require('../helper/calculateUniTvl');
const { transformHecoAddress, transformBscAddress } = require('../helper/portedTokens.js')

const factories = {
  heco: "0xb0b670fc1F7724119963018DB0BfA86aDb22d941",
  bsc: "0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8",
};

const hecoTvl = async (timestamp, ethBlock, chainBlocks) => {
  let block = chainBlocks.heco;
  if (block === undefined) {
    block = (await sdk.api.util.lookupBlock(timestamp, { chain: "heco" }))
      .block;
  };

  const transform = await transformHecoAddress();
  let balances = await calculateUniTvl(transform, block, 'heco', factories.heco, 986830, true);
  return balances
};
const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const transform = await transformBscAddress();
  return await calculateUniTvl(transform, chainBlocks.bsc, 'bsc', factories.bsc, 0, true)
};

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: bscTvl, //   individually outputs >1B    ---   breakdown per token             (OK)
  },
  heco: {
    tvl: hecoTvl, //  individually outputs >1B    ---   simply using graphql endpoint   (OK)
  },
  tvl: sdk.util.sumChainTvls([hecoTvl, bscTvl]),
};
