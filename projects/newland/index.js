const sdk = require("@defillama/sdk");
const abi = require("./abi.json")

const { unwrapLPsAuto, } = require("../helper/unwrapLPs");
const { getChainTransform } = require("../helper/portedTokens");

const BoosterStakingChef_Heco = "0x7970234cDfa8898853Eaa1e2586cE933d9054af8";
const MdexStakingChef_Heco = "0x44aEfA01E92d170C915D87C2AB03D03cA49D5cb5";
const LavaStakingChef_heco = "0x9B948c946BE7F062D2075744142896F08D32a8A5";
const SushiStakingChef_Ethereum = "0x0503866eD9F304Ec564F145d22994F7f11838596";

const calcTvl = async (balances, chain, block, poolInfo, StakingChef, transform) => {
  const lengthOfPool = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: StakingChef,
      chain, block,
    })
  ).output;

  const calls = []
  for (let index = 0; index < lengthOfPool; index++) calls.push({ params: index })

  const { output: data } = await sdk.api.abi.multiCall({
    target: StakingChef,
    abi: poolInfo,
    calls,
    chain, block,
  })

  data.forEach(({ output }) => {
    sdk.util.sumSingleBalance(balances, transform(output.lpToken), output.lpBalance)
  })
};

/*** Heco TVL Portion ***/
const hecoTvl = async (timestamp, ethBlock, { heco: block }) => {
  const balances = {};
  const chain = 'heco'
  let transformAddress = await getChainTransform(chain)

  await Promise.all([
    //  --- Staking on Booster Protcol ---
    calcTvl(balances, chain, block, abi.poolInfoA, BoosterStakingChef_Heco, transformAddress),
    //  --- Staking on Mdex Protcol ---
    calcTvl(balances, chain, block, abi.poolInfoB, MdexStakingChef_Heco, transformAddress),
    //  --- Staking on Lava Protcol ---
    calcTvl(balances, chain, block, abi.poolInfoB, LavaStakingChef_heco, transformAddress),
  ])

  await unwrapLPsAuto({ balances, block, chain, transformAddress })
  return balances;
};

/*** Ethereum TVL Portion ***/
const ethTvl = async (timestamp, ethBlock, { ethereum: block }) => {
  const balances = {}
  const chain = 'ethereum'
  let transformAddress = await getChainTransform(chain)

  //  --- Staking on SushiSwap Protcol ---
  await calcTvl(balances, chain, block, abi.poolInfoB, SushiStakingChef_Ethereum, transformAddress)
  await unwrapLPsAuto({ balances, block, chain, transformAddress })
  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  heco: {
    tvl: hecoTvl,
  },
  methodology: `We count TVL on the pools (LP tokens), that are staking in other protocolos as Booster, Mdex and Lava on Heco Network
   and SushiSwap  on Ethereum Network,threw their correspondent MasterChef contracts; and Treasury part separated`,
};
