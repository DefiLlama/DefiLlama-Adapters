const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const YieldContract = "0xE4Baf69B887843aB6A0e82E8BAeA49010fF619af";

const ETH = "0x0000000000000000000000000000000000000000";

const LendingPool = "0xbc3534b076EDB8E8Ef254D81b81DC193c53057F7";

/*** ETH TVL Portion ***
* Yield Contract is in ethereum network, neither at the protocol web nor at their docs, 
* they didn't mentioned anything about that.
*/
const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const ethBalance = (
    await sdk.api.eth.getBalance({
      target: YieldContract,
      ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, ETH, ethBalance);

  const getNoOfErc20s = (
    await sdk.api.abi.call({
      abi: abi.getNoOfErc20s,
      target: YieldContract,
      ethBlock,
    })
  ).output;

  for (let index = 0; index < getNoOfErc20s; index++) {
    const erc20List = (
      await sdk.api.abi.call({
        abi: abi.erc20List,
        target: YieldContract,
        params: index,
        ethBlock,
      })
    ).output;

    try {
      const erc20Balance = (
        await sdk.api.erc20.balanceOf({
          target: erc20List,
          owner: YieldContract,
          ethBlock,
        })
      ).output;

      sdk.util.sumSingleBalance(balances, erc20List, erc20Balance);
    } catch (error) {
      console.error(error);
    }
  }

  return balances;
};

// *** BSC TVL Portion ***

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const getReserves = (
    await sdk.api.abi.call({
      abi: abi.getReserves,
      target: LendingPool,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  for (let index = 0; index < getReserves.length; index++) {
    const mTokenAddress = (
      await sdk.api.abi.call({
        abi: abi.getReserveData,
        target: LendingPool,
        params: getReserves[index],
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output[11];

    const totalSupply = (
      await sdk.api.abi.call({
        abi: abi.totalSupply,
        target: mTokenAddress,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;

    sdk.util.sumSingleBalance(
      balances,
      `bsc:${getReserves[index]}`,
      totalSupply
    );
  }

  return balances;
};

module.exports = {
  eth: {
    tvl: ethTvl,
  },
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl, bscTvl]),
};
