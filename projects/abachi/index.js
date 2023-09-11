const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const Treasury_Eth = "0x6fce4c6cdd8c4e6c7486553d09bdd9aee61cf095";

async function ethTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
	  [ADDRESSES.ethereum.WSTETH, false],
	  [ADDRESSES.ethereum.STETH, false],
	  [ADDRESSES.ethereum.WBTC, false],
	  [ADDRESSES.ethereum.WETH, false],
	  [ADDRESSES.ethereum.UDSC, false],
	  [ADDRESSES.ethereum.USDT, false],
	  [ADDRESSES.ethereum.RETH, false],
      ["0xBF0B8b7475EdB32D103001Efd19FdD2753d7B76D", false], // Abachi (ABI)
    ],
    [Treasury_Eth],
    ethBlock,
    "ethereum"
  );

  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  methodology:
    "Counts tokens on the treasury for TVL",
};
