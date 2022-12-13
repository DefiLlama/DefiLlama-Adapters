const sdk = require("@defillama/sdk");
const {
  constants: { AddressZero },
} = require("ethers");
const abi = require("./abi.json");

const exactly = async (network, block) =>
  (
    await sdk.api.abi.call({
      abi: abi.find(({ name }) => name === "exactly"),
      target: {
        ethereum: "0x0AA3529ae5FdBCeB69Cf8ab2b9e2d3Af85860469",
      }[network],
      params: [AddressZero],
      block,
    })
  ).output;

const tvl = (network) => async (_, block) =>
  Object.fromEntries(
    (await exactly(network, block)).map(
      ({
        asset,
        fixedPools,
        totalFloatingBorrowAssets,
        totalFloatingDepositAssets,
      }) => [
        asset,
        fixedPools.reduce(
          (total, { borrowed, supplied }) =>
            total + BigInt(supplied) - BigInt(borrowed),
          0n
        ) +
          BigInt(totalFloatingDepositAssets) -
          BigInt(totalFloatingBorrowAssets),
      ]
    )
  );

const borrowed = (network) => async (_, block) =>
  Object.fromEntries(
    (await exactly(network, block)).map(
      ({ asset, fixedPools, totalFloatingBorrowAssets }) => [
        asset,
        fixedPools.reduce(
          (total, { borrowed }) => total + BigInt(borrowed),
          0n
        ) + BigInt(totalFloatingBorrowAssets),
      ]
    )
  );

module.exports = {
  timetravel: true,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There are multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
  ethereum: {
    start: 16134393,
    tvl: tvl("ethereum"),
    borrowed: borrowed("ethereum"),
  },
};
