const Abis = require("./abi.json");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const Contracts = {
  fantom: {
    wftm: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
    zsp: "0x2C26617034C840C9412CD67aE0Fc68A6755D00BF",
    ftmz: "0x9e219b51891e2c62ea8a2ea438d331eae7c68484",
    usdc: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
    bank: "0x9fc3E5259Ba18BD13366D0728a256E703869F21D",
    multiFeeDistribution: "0x1b6deD5c603d66800B0DDf566Ec316a344C7BcaD",
    chef: "0xFdAa392FCF8946e8e658B9f36ffbE6659cB40edf",
    lps: [
      {
        address: "0xcAa542473912a727C7F6715458db8C5f9b0291FC", // ZSP-WFTM
        isToken0: true,
      },
      {
        address: "0xd02cc84b296ef3332Ca9371fC633bB7D7a51ad32", // FTMz-WFTM
        isToken0: true,
      },
      {
        address: "0x2ABDC15324a38093e07b9EBF7c15bD8e672E212e", // ZSP-USDC
        isToken0: true,
      },
    ],
  },
};

async function calcTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.fantom;
  const chain = "fantom";

  const bankBalance = await sdk.api.abi.call({
    target: Contracts.fantom.bank,
    abi: Abis.bank.usableCollateralBalance,
    chain: chain,
    block,
  });

  return {
    [`fantom:${Contracts.fantom.wftm}`]: +bankBalance.output,
  };
}

async function calcStakingTvl(timestamp, ethBlock, chainBlocks) {
  const block = chainBlocks.fantom;
  const chain = "fantom";

  const stakingData = await sdk.api.abi.call({
    target: Contracts.fantom.multiFeeDistribution,
    abi: Abis.multiFeeDistribution.totalSupply,
    chain: chain,
    block,
  });

  return {
    [`fantom:${Contracts.fantom.zsp}`]: stakingData.output,
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
        params: [Contracts.fantom.chef],
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;

  const results = lps.map((lp, index) =>
    new BigNumber(
      reserves[index].output[lp.isToken0 ? "_reserve0" : "_reserve1"]
    )
      .times(2)
      .times(new BigNumber(balances[index].output))
      .idiv(new BigNumber(totalSupplies[index].output))
  );
  const total = results.reduce(
    (total, num) => total.plus(num),
    new BigNumber(0)
  );

  return {
    [`fantom:${baseToken}`]: total.toString(10),
  };
}

async function ftmPool2(timestamp, block, chainBlocks) {
  const zsp = await calcLp(
    Contracts.fantom.lps,
    chainBlocks.fantom,
    "fantom",
    Contracts.fantom.zsp
  );

  const ftmz = await calcLp(
    Contracts.fantom.lps,
    chainBlocks.fantom,
    "fantom",
    Contracts.fantom.wftm
  );

  return { ...zsp, ...ftmz };
}

module.exports = {
  fantom: {
    tvl: calcTvl,
    pool2: ftmPool2,
    staking: calcStakingTvl,
  },
};
