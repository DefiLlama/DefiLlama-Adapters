const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const { transformBscAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

//Staking OOE Token Contract
const SimpleStakingOOE_Etherem = "0xB99D38eB69214e493B1183FFA3d561FC9F75D519";

//Staking OOE-BNB LP Contract
const SimpleStakingOOB_BNB_Bsc = "0x1b4F54090F29eF9f94487969AEC31F2F6Dca88D7";

//Staking OOE-BUSD LP Contract
const SimpleStakingOOB_BUSD_Bsc = "0xB3ccece7f26acd558a2Eb7Eab53ae4D840b3401D";

const calcTvl = async (balances, chain, block, SimpleStaking) => {
  const erc20TokenOrLp = (
    await sdk.api.abi.call({
      abi: abi.stakeToken,
      target: SimpleStaking,
      chain,
      block,
    })
  ).output;

  const transformAddress = await transformBscAddress();

  await sumTokensAndLPsSharedOwners(
    balances,
    SimpleStaking == SimpleStakingOOE_Etherem
      ? [[erc20TokenOrLp, false]]
      : [[erc20TokenOrLp, true]],
    [SimpleStaking],
    block,
    chain,
    chain == "bsc" ? transformAddress : (addr) => addr
  );
};

/*** Staking of native token (OOE) on Ethereum TVL portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await calcTvl(
    balances,
    "ethereum",
    chainBlocks["ethereum"],
    SimpleStakingOOE_Etherem
  );

  return balances;
};

/*** Binance TVL Portion ***/
const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await calcTvl(balances, "bsc", chainBlocks["bsc"], SimpleStakingOOB_BNB_Bsc);

  await calcTvl(balances, "bsc", chainBlocks["bsc"], SimpleStakingOOB_BUSD_Bsc);

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking: {
    tvl: staking,
  },
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
  methodology: `We count as TVL the staking OOE-BNB and OOE-BUSD LPs on Binance network 
  threw their SimpleStaking contracts; and we count the staking native token (OOE) on Ethereum network`,
};
