const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const { aaveExports } = require("../helper/aave");
const { sumTokens2 } = require("../helper/unwrapLPs");
const abi = require("./abis.json");

const AAVE_ADDRESSES_PROVIDER_REGISTRY =
  "0x90C5055530C0465AbB077FA016a3699A3F53Ef99";
const AAVE_POOL_DATA_PROVIDER = "0x2A0979257105834789bC6b9E1B00446DFbA8dFBa";
const GEYSER_REGISTRY = "0xD5815fC3D736120d07a1fA92bA743c1167dA89d8";

function geyserExports(chain) {
  return async (_, _1, _2, { block }) => {
    const geyserCount = (
      await sdk.api.abi.call({
        target: GEYSER_REGISTRY,
        abi: abi["instanceCount"],
        chain,
        block,
      })
    ).output;

    console.log("geyserCount: ", geyserCount);

    const calls = [];
    for (let i = 0; i < geyserCount; i++) {
      calls.push({
        target: GEYSER_REGISTRY,
        params: [i],
        chain,
        block,
      });
    }

    console.log("calls[]: ", calls);

    const geysers = (
      await sdk.api.abi.multiCall({
        calls,
        abi: abi["instanceAt"],
        chain,
        block,
      })
    ).output;

    console.log("geysers: ", geysers);

    const geysersData = (
      await sdk.api.abi.multiCall({
        calls: geysers.map((g) => ({
          target: g.output,
          params: [],
        })),
        abi: abi["getGeyserData"],
        chain,
        block,
      })
    ).output;

    console.log("geysersData: ", geysersData);

    const wrappedUnderlying = (
      await sdk.api.abi.multiCall({
        calls: geysersData.map((d) => ({
          target: d.output.stakingToken,
          params: [],
        })),
        abi: abi["underlying"],
        chain,
        block,
        permitFailure: true,
      })
    ).output;

    const notWrappedTokensAndOwners = wrappedUnderlying
      .map((w, i) => {
        if (w.success) {
          return;
        }

        return [w.input.target, geysersData[i].input.target];
      })
      .filter((f) => f);

    console.log("notWrappedTokensAndOwners: ", notWrappedTokensAndOwners);
    console.log("wrappedUnderlying: ", wrappedUnderlying);

    const aTokenUnderlying = (
      await sdk.api.abi.multiCall({
        calls: wrappedUnderlying.map((d) => ({
          target: d.output,
          params: [],
        })),
        abi: abi["UNDERLYING_ASSET_ADDRESS"],
        permitFailure: true,
        chain,
        block,
      })
    ).output;

    const notATokenTokensAndOwners = aTokenUnderlying
      .map((w, i) => {
        if (w.success) {
          return;
        }

        return [w.input.target, wrappedUnderlying[i].input.target];
      })
      .filter((f) => f);

    console.log("notATokenTokensAndOwners: ", notATokenTokensAndOwners);
    console.log("aTokenUnderlying: ", aTokenUnderlying);

    const underlyingBalance = await sdk.api.abi.multiCall({
      calls: geysersData.map((d) => ({
        target: d.output.stakingToken,
        params: [],
      })),
      abi: abi["totalUnderlying"],
      chain,
      block,
      permitFailure: true,
    });

    console.log("underlyingBalance: ", JSON.stringify(underlyingBalance));

    let balances = await sumTokens2({
      chain,
      block,
      tokensAndOwners: notWrappedTokensAndOwners.concat(
        notATokenTokensAndOwners
      ),
    });

    aTokenUnderlying
      .forEach((t, i) => {
        if (!t.success) {
          return;
        }

        let address = t.output;
        const balance = BigNumber(underlyingBalance.output[i].output);

        if (!address || balance.lte(0)) {
          return;
        }

        address = `${chain}:${address}`;

        balances[address] = BigNumber(balances[address] ?? 0)
          .plus(balance)
          .toString();
      });

    console.log("balances: ", balances);

    return balances;
  };
}

function aggregate() {
  const { tvl: tvlAave, borrowed } = aaveExports(
    "base",
    AAVE_ADDRESSES_PROVIDER_REGISTRY,
    undefined,
    [AAVE_POOL_DATA_PROVIDER],
    { v3: true }
  );
  const tvlGeyser = geyserExports("base");

  return {
    tvl: async (_, _1, _2, { api, block }) => {
      const balances = {};
      sdk.util.mergeBalances(balances,
        await tvlGeyser(_, _1, _2, { api, block })
      );
      sdk.util.mergeBalances(balances,
        await tvlAave(_, _1, _2, { api, block })
      );
      console.log("merged balances: ", balances);
      return balances;
    },
    borrowed,
  };
}

module.exports = {
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  base: aggregate(),
  start: 1,
};
// node test.js projects/seamless/index.js
