const sdk = require("@defillama/sdk");
const { calculateUniTvl } = require('../helper/calculateUniTvl');
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { transformBscAddress } = require('../helper/portedTokens.js')

const factories = {
  heco: "0xb0b670fc1F7724119963018DB0BfA86aDb22d941",
  bsc: "0x3CD1C46068dAEa5Ebb0d3f55F6915B10648062B8",
};

const hecoTvl = calculateUsdUniTvl(factories.heco, 'heco',
  "0xa71edc38d189767582c38a3145b5873052c3e47a", //USDT
  [
    "0x64ff637fb478863b7468bc97d30a5bf3a428a1fd", //ETH
    "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f", //WHT
    "0x66a79d23e58475d2738179ca52cd0b41d73f0bea", //HBTC
    "0x0298c2b32eae4da002a15f36fdf7615bea3da047", //HUSD
    "0x25d2e80cb6b86881fd7e07dd263fb79f4abe033c", //MDX
  ],
  "tether");

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const transform = await transformBscAddress();
  return calculateUniTvl(transform, chainBlocks.bsc, 'bsc', factories.bsc, 0, true)
};

module.exports = {
  misrepresentedTokens: true,
  cantRefill: true,
  bsc: {
    tvl: bscTvl,
  },
  heco: {
    tvl: hecoTvl,
  }
};
