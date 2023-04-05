const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2BalanceFromMasterChefExports } = require("../helper/pool2");
const { addFundsInMasterChef } = require("../helper/masterchef");

const masterChefCASH = "0xa4De1bCf1CBFc0d675c7a49Cd7d6aD132a35F15d";
const CASH = "0x654C908305021b2eaF881cEe774ECe1D2BCac5fc";

const masterChefSHARE = "0x18ac4eB45E3eE74bDeD0B97E0D08f2A3ca992F7e";
const SHARE = "0x0f96d8c1277BD75A251238af952A7A99Db1320E3";

const boardroom = "0x9D0047E9D09245cb18d2D3Ec7D48515A067086B1";

const transformAddress = (addr) => `arbitrum:${addr}`;

async function arbitrumTvl(timestamp, block, chainBlocks) {
  const balances = {};

  await addFundsInMasterChef(
    balances,
    masterChefCASH,
    chainBlocks.arbitrum,
    "arbitrum",
    transformAddress,
    abi.poolInfo,
    [CASH],
    true,
    true,
    CASH
  );

  await addFundsInMasterChef(
    balances,
    masterChefSHARE,
    chainBlocks.arbitrum,
    "arbitrum",
    transformAddress,
    abi.poolInfo,
    [SHARE],
    true,
    true,
    SHARE
  );

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    staking: sdk.util.sumChainTvls([
      staking(boardroom, SHARE, "arbitrum")
    ]),
    pool2: sdk.util.sumChainTvls([
      pool2BalanceFromMasterChefExports(
        masterChefCASH,
        CASH,
        "arbitrum",
        transformAddress
      ),
      pool2BalanceFromMasterChefExports(
        masterChefSHARE,
        SHARE,
        "arbitrum",
        transformAddress
      )

    ]),
    tvl: arbitrumTvl
  },
  methodology:
    "Counts TVL on all the farms and pools through MasterChef Contracts"
};
