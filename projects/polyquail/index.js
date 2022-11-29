const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2BalanceFromMasterChefExports } = require("../helper/pool2");
const { addFundsInMasterChef } = require("../helper/masterchef");
const { transformPolygonAddress } = require("../helper/portedTokens");

const masterChefKWIL = "0xeA038416Ed234593960704ddeD73B78f7D578AA0";
const KWIL = "0x252656AdC9E22C697Ce6c08cA9065FBEe5E394e7";

const masterChefKEGG = "0xE1de7a777C1f0C85ca583c143b75e691a693e04B";
const KEGG = "0x4f219CfC1681c745D9558fd64d98373A21a246CA";

const masterChefCHK = "0x439E9BE4618bfC5Ebe9B7357d848F65D24a50dDE";
const CHK = "0x6116A2A8Ea71890Cf749823Ee9DEC991930a9eEa";

async function polygonTvl(timestamp, block, chainBlocks) {
  const balances = {};

  const transformAddress = await transformPolygonAddress();

  await addFundsInMasterChef(
    balances,
    masterChefKWIL,
    chainBlocks.polygon,
    "polygon",
    transformAddress,
    abi.poolInfo,
    [KWIL],
    true,
    true,
    KWIL
  );

  await addFundsInMasterChef(
    balances,
    masterChefKEGG,
    chainBlocks.polygon,
    "polygon",
    transformAddress,
    abi.poolInfo,
    [KEGG],
    true,
    true,
    KEGG
  );

  await addFundsInMasterChef(
    balances,
    masterChefCHK,
    chainBlocks.polygon,
    "polygon",
    transformAddress,
    abi.poolInfo,
    [CHK],
    true,
    true,
    CHK
  );
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    staking: sdk.util.sumChainTvls([
      staking(masterChefKWIL, KWIL, "polygon"),
      staking(masterChefKEGG, KEGG, "polygon"),
      staking(masterChefCHK, CHK, "polygon"),
    ]),
    pool2: sdk.util.sumChainTvls([
      pool2BalanceFromMasterChefExports(
        masterChefKWIL,
        KWIL,
        "polygon",
        (addr) => `polygon:${addr}`
      ),
      pool2BalanceFromMasterChefExports(
        masterChefKEGG,
        KEGG,
        "polygon",
        (addr) => `polygon:${addr}`
      ),
      pool2BalanceFromMasterChefExports(
        masterChefCHK,
        CHK,
        "polygon",
        (addr) => `polygon:${addr}`
      ),
    ]),
    tvl: polygonTvl,
  },
  methodology:
    "Counts TVL on all the farms and pools through MasterChef Contracts",
};
