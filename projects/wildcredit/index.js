const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");

const pair_factory = "0x23B74796b72f995E14a5e3FF2156Dad9653256Cf";
const toAddr= d=>"0x"+d.substr(26)

const calcTvl = async (balances, block, token, balance) => {
  const START_BLOCK = 12867493;
  const END_BLOCK = block;
  const events = await sdk.api.util.getLogs({
    target: pair_factory,
    topic: 'PairCreated(address,address,address)',
    keys: [],
    fromBlock: START_BLOCK,
    toBlock: END_BLOCK,
  })
  const pairs = events.output.map(el => toAddr(el.topics[1]));

  const tokens = (await sdk.api.abi.multiCall({
    abi: token,
    calls: pairs.map(pair => ({
      target: pair
    })),
    block
  })).output.map(t => t.output);

  if (balance == erc20.balanceOf) {
    const balancePairs = (await sdk.api.abi.multiCall({
      abi: balance,
      calls: pairs.map((pair, idx) => ({
        target: tokens[idx],
        params: pair
      })),
      block
    })).output.map(bp => bp.output);

    for (let index = 0; index < pairs.length; index++) {
      sdk.util.sumSingleBalance(
        balances,
        tokens[index],
        balancePairs[index]
      );
    }
  } else {
    const totalDebt = (await sdk.api.abi.multiCall({
      abi: balance,
      calls: pairs.map((pair, idx) => ({
        target: pair,
        params: tokens[idx]
      })),
      block,
    })).output.map(td => td.output);

    for (let index = 0; index < pairs.length; index++) {
      sdk.util.sumSingleBalance(
        balances,
        tokens[index],
        totalDebt[index]
      );
    }
  }
}

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  //  --- Total of TVL's pairs without using ---
  await calcTvl(
    balances,
    ethBlock,
    abi.tokenA,
    erc20.balanceOf
  );

  await calcTvl(
    balances,
    ethBlock,
    abi.tokenB,
    erc20.balanceOf
  );

  //  --- Total of TVL's pairs with using ---
  await calcTvl(
    balances,
    ethBlock,
    abi.tokenA,
    abi.totalDebt,
  );

  await calcTvl(
    balances,
    ethBlock,
    abi.tokenB,
    abi.totalDebt,
  );

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
};
