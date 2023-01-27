const BigNumber = require('bignumber.js')
const Abis = require("./abi.json");
const sdk = require("@defillama/sdk");

const Contracts = {
  kava: {
    wkava: "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b",
    akiba: "0xC9b23289c60783649AA327732FCCEc2f5d0aC466",
    bank: "0x0CA1088C075E5C9447D5C07984aCCc48c816D01D", // Pool
    multiFeeDistribution: "0xa41045953C7fa32CCea9132997b2E7460db5ae3F", // Staking
    chef: "0x6b2349b0B2b2b9c1B970a1d0E5AB4226d6Cb78c8",
    lps: [
      {
        address: "0xAd18F4d2087d954989d7b1f728AeE1941F7BC25F", // AKIBA_KAVA_LP
        isToken0: false
      },
      {
        address: "0xc75Bd803C2671fC4C0d7350C88e8250e9F7E9805", // KAVAX_KAVA_LP
        isToken0: false
      }
    ]
  },
};

async function calcTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.kava;
  const chain = "kava";

  const bankBalance = await sdk.api.abi.call({
    target: Contracts.kava.bank,
    abi: Abis.bank.usableCollateralBalance,
    chain: chain,
    block,
  });

  return {
    [`kava:${Contracts.kava.wkava}`]: bankBalance.output,
  };
}

async function calcStaking(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.kava;
  const chain = "kava";

  const pairInfo = await sdk.api.abi.call({
    target: Contracts.kava.lps[0].address,
    abi: Abis.pair.getReserves,
    chain: chain,
    block,
  });
  const akibaPrice = new BigNumber(pairInfo.output._reserve1).div(new BigNumber(pairInfo.output._reserve0));

  const stakingData = await sdk.api.abi.call({
    target: Contracts.kava.multiFeeDistribution,
    abi: Abis.multiFeeDistribution.totalSupply,
    chain: chain,
    block,
  });

  return {
    [`kava:${Contracts.kava.wkava}`]: new BigNumber(stakingData.output).times(akibaPrice)
  };
}

async function calcLp(lps, block, chain, baseToken) {
  const reserves = (
    await sdk.api.abi.multiCall({
      calls: lps.map((lp) => ({
        target: lp.address,
        params: [],
      })),
      abi: Abis.pair.getReserves,
      block,
      chain,
    })
  ).output;
  const totalSupplies = (
    await sdk.api.abi.multiCall({
      calls: lps.map((lp) => ({
        target: lp.address,
        params: [],
      })),
      abi: "erc20:totalSupply",
      block,
      chain,
    })
  ).output;
  const balances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((lp) => ({
        target: lp.address,
        params: [Contracts.kava.chef],
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;

  const results = lps.map((lp, index) => (
    new BigNumber(reserves[index].output[lp.isToken0 ? "_reserve0" : "_reserve1"])
      .times(2)
      .times(new BigNumber(balances[index].output))
      .idiv(new BigNumber(totalSupplies[index].output))
  ));
  const total = results.reduce((total, num) => total.plus(num), new BigNumber(0));

  return {
    [`kava:${baseToken}`]: total.toString(10),
  };
}

async function calcChef(timestamp, block, chainBlocks) {
  const farm = await calcLp(Contracts.kava.lps, chainBlocks.kava, "kava", Contracts.kava.wkava);

  return { ...farm, };
}

module.exports = {
  kava: {
    tvl: calcTvl,
    pool2: calcChef,
    staking: calcStaking,
  },
};
