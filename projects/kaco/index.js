const sdk = require("@defillama/sdk");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { calculateUniTvl } = require("../helper/calculateUniTvl.js");
const { pool2 } = require("../helper/pool2");
const { staking, stakingUnknownPricedLP} = require("../helper/staking");

const KACMasterChefContract = {
  bsc: "0x81b71D0bC2De38e37978E6701C342d0b7AA67D59",
  shiden: "0x293A7824582C56B0842535f94F6E3841888168C8",
};
const KACFactory = {
  bsc: "0xa5e48a6E56e164907263e901B98D9b11CCB46C47",
  shiden: "0xcd8620889c1dA22ED228e6C00182177f9dAd16b7",
};
const KAC = {
  bsc: "0xf96429A7aE52dA7d07E60BE95A3ece8B042016fB",
  shiden: "0xb12c13e66ade1f72f71834f2fc5082db8c091358",
};
async function bscTvl(timestamp, block, chainBlocks) {
  return calculateUniTvl(
    (addr) => `bsc:${addr}`,
    chainBlocks["bsc"],
    "bsc",
    KACFactory["bsc"],
    0,
    true
  );
}
async function poolsTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const stakedKAC = sdk.api.erc20.balanceOf({
    target: KAC["bsc"],
    owner: KACMasterChefContract["bsc"],
    chain: "bsc",
    block: chainBlocks["bsc"],
  });
  sdk.util.sumSingleBalance(
    balances,
    "bsc:" + KAC["bsc"],
    (await stakedKAC).output
  );
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Fast growing Defi on BSC and Shiden! Fractionalize and farm NFTs.",
  bsc: {
    staking: stakingUnknownPricedLP("0x81b71D0bC2De38e37978E6701C342d0b7AA67D59", "0xf96429A7aE52dA7d07E60BE95A3ece8B042016fB", "bsc", "0x315F25Cea80AC6c039B86e79Ffc46aE6b2e30922", addr=>`bsc:${addr}`),
    tvl: bscTvl,
  },
  shiden: {
    staking: staking(
      KACMasterChefContract["shiden"],
      KAC["shiden"],
      "shiden",
      KAC["bsc"],
      0
    ),
    tvl: calculateUsdUniTvl(
      "0xcd8620889c1dA22ED228e6C00182177f9dAd16b7",
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
