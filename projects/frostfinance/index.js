const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2BalanceFromMasterChefExports } = require("../helper/pool2");
const { addFundsInMasterChef } = require("../helper/masterchef");

const masterChefTUNDRA = "0x87f1b38D0C158abe2F390E5E3482FDb97bC8D0C5";
const TUNDRA = "0x21c5402C3B7d40C89Cc472C9dF5dD7E51BbAb1b1";

const masterChefEXP = "0x02941a0Ffa0Bb0E41D9d96314488d2E7652EDEa6";
const EXP = "0xf57b80a574297892b64e9a6c997662889b04a73a";

const masterChefDUNE = "0xCEA209Fafc46E5C889A8ad809e7C8e444B2420C0";
const DUNE = "0x314f3bee25e49ea4bcea9a3d1321c74c95f10eab";

async function avaxTvl(timestamp, block, chainBlocks) {
  const balances = {};

  const transformAddress = addr => 'avax:'+addr

  await addFundsInMasterChef(
    balances,
    masterChefTUNDRA,
    chainBlocks.avax,
    "avax",
    transformAddress,
    abi.poolInfo,
    [TUNDRA],
    true,
    true,
    TUNDRA
  );

  await addFundsInMasterChef(
    balances,
    masterChefEXP,
    chainBlocks.avax,
    "avax",
    transformAddress,
    abi.poolInfo,
    [EXP],
    true,
    true,
    EXP
  );

  await addFundsInMasterChef(
    balances,
    masterChefDUNE,
    chainBlocks.avax,
    "avax",
    transformAddress,
    abi.poolInfo,
    [DUNE],
    true,
    true,
    DUNE
  );
  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  avax: {
    staking: sdk.util.sumChainTvls([
      staking(masterChefTUNDRA, TUNDRA, "avax"),
      staking(masterChefEXP, EXP, "avax"),
      staking(masterChefDUNE, DUNE, "avax"),
    ]),
    pool2: sdk.util.sumChainTvls([
      pool2BalanceFromMasterChefExports(
        masterChefTUNDRA,
        TUNDRA,
        "avax",
        (addr) => `avax:${addr}`
      ),
      pool2BalanceFromMasterChefExports(
        masterChefEXP,
        EXP,
        "avax",
        (addr) => `avax:${addr}`
      ),
      pool2BalanceFromMasterChefExports(
        masterChefDUNE,
        DUNE,
        "avax",
        (addr) => `avax:${addr}`
      ),
    ]),
    tvl: avaxTvl,
  },
  methodology:
    "Counts TVL on all the farms and pools through MasterChef Contracts",
};
