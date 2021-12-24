const abi = require("./abi.json");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformBscAddress } = require("../helper/portedTokens");
const { staking } = require("../helper/staking");

const KACMasterChefContract = {
  bsc: "0x81b71D0bC2De38e37978E6701C342d0b7AA67D59",
  shiden: "0x293A7824582C56B0842535f94F6E3841888168C8",
};
const KAC = {
  bsc: "0xf96429A7aE52dA7d07E60BE95A3ece8B042016fB",
  shiden: "0xb12c13e66ade1f72f71834f2fc5082db8c091358",
};

// node test.js projects/kaco/index.js
const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let transformAddress = await transformBscAddress();

  await addFundsInMasterChef(
    balances,
    KACMasterChefContract["bsc"],
    chainBlocks["bsc"],
    "bsc",
    transformAddress,
    abi.poolInfo,
    [KAC["bsc"], KACMasterChefContract["bsc"]]
  );

  return balances;
};

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "Fast growing Defi on BSC and Shiden! Fractionalize and farm NFTs.",
  bsc: {
    staking: staking(KACMasterChefContract["bsc"], KAC["bsc"], "bsc"),
    tvl: bscTvl,
  },
  shiden: {
    tvl: calculateUsdUniTvl(
      "0x073386AE3292299a5814B00bC1ceB8f2bfC92c51",
      "shiden",
      "0x0f933Dc137D21cA519ae4C7E93f87a4C8EF365Ef",
      [
        // USDC
        "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
        // USDT
        "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
        // JPYC
        "0x735aBE48e8782948a37C7765ECb76b98CdE97B0F",
        // STND
        "0x722377A047e89CA735f09Eb7CccAb780943c4CB4",
      ],
      "shiden"
    ),
  },
};
