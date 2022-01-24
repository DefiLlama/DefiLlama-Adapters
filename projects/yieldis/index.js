const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const pool_factory = "0xe4D5A6128308b4D5c5d1A107Be136AB75c9944Be";
const join_factory = "0x7297644611Af0dBb1bE1C2B4885DE9288eDD81e8";

const toAddr = (d) => "0x" + d.substr(26);

const calcTvl = async (
  balances,
  block,
  factory,
  creation,
  address = "address"
) => {
  const START_BLOCK = 13452556;
  const END_BLOCK = block;
  const events = (
    await sdk.api.util.getLogs({
      target: factory,
      topic: `${creation}(address,${address})`,
      keys: [],
      fromBlock: START_BLOCK,
      toBlock: END_BLOCK,
    })
  ).output.map((event) => toAddr(event.data));

  if (factory == pool_factory) {
    /*** Pools TVL Portion includes Bases and FyTokens ***/
    const bases = (
      await sdk.api.abi.multiCall({
        abi: abi.base,
        calls: events.map((pool) => ({
          target: pool,
        })),
        block,
      })
    ).output.map((b) => b.output);

    const fyTokens = (
      await sdk.api.abi.multiCall({
        abi: abi.fyToken,
        calls: events.map((pool) => ({
          target: pool,
        })),
        block,
      })
    ).output.map((ft) => ft.output);

    const fyTokensUnderlying = (
      await sdk.api.abi.multiCall({
        abi: abi.underlying,
        calls: fyTokens.map((fyToken) => ({
          target: fyToken,
        })),
        block,
      })
    ).output.map((underlying) => underlying.output);

    const basesBalance = (
      await sdk.api.abi.multiCall({
        abi: abi.getBaseBalance,
        calls: events.map((pool) => ({
          target: pool,
        })),
        block,
      })
    ).output.map((bbal) => bbal.output);

    const fyTskensBalance = (
      await sdk.api.abi.multiCall({
        abi: abi.getFYTokenBalance,
        calls: events.map((pool) => ({
          target: pool,
        })),
        block,
      })
    ).output.map((ftbal) => ftbal.output);

    for (let i = 0; i < events.length; i++) {
      if (basesBalance[i] == null) {
      } else {
        sdk.util.sumSingleBalance(balances, bases[i], basesBalance[i]);
      }
      sdk.util.sumSingleBalance(
        balances,
        fyTokensUnderlying[i],
        fyTskensBalance[i]
      );
    }
  } else {

    /*** Joins TVL Portion ***/
    const joinsAsset = (
      await sdk.api.abi.multiCall({
        abi: abi.asset,
        calls: events.map((join) => ({
          target: join,
        })),
        block,
      })
    ).output.map((a) => a.output);

    const assetsBalance = (
      await sdk.api.abi.multiCall({
        abi: abi.storedBalance,
        calls: events.map((join) => ({
          target: join,
        })),
        block,
      })
    ).output.map((a) => a.output);

    for (let i = 0; i < events.length; i++) {
      sdk.util.sumSingleBalance(balances, joinsAsset[i], assetsBalance[i]);
    }
  }
};

const ethTvl = async (timestamp, ethBlock) => {
  const balances = {};

  await calcTvl(
    balances,
    ethBlock,
    pool_factory,
    "PoolCreated",
    "address,address"
  );

  await calcTvl(
    balances,
    ethBlock,
    join_factory,
    "JoinCreated"
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
  methodology:
    "Counts tvl on the Pools and Joins through PoolFactory and Joinfactory Contracts",
};
