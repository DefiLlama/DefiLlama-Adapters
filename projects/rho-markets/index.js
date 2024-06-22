const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const tokenVaults = [
  "0x639355f34Ca9935E0004e30bD77b9cE2ADA0E692",
  "0xAD3d07d431B85B525D81372802504Fa18DBd554c",
  "0xAE1846110F72f2DaaBC75B7cEEe96558289EDfc5",
  "0x855CEA8626Fa7b42c13e7A688b179bf61e6c1e81",
  "0xe4FC4C444efFB5ECa80274c021f652980794Eae6",
];

const tokens = [
  "0x0000000000000000000000000000000000000000",
  "0x80137510979822322193FC997d400D5A6C747bf7",
  "0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4",
  "0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df",
  "0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32",
];

async function borrowed(api) {
  const calls = tokenVaults.map((vault) => ({ target: vault }));
  const { output: borrows } = await sdk.api.abi.multiCall({
    calls,
    block: api.block,
    abi: "uint256:totalBorrows",
    chain: "scroll",
  });

  const balances = {};
  borrows.forEach(({ output }, i) =>
    sdk.util.sumSingleBalance(balances, tokens[i], output, "scroll")
  );

  return balances;
}

async function tvl(api) {
  const calls = tokenVaults.map((vault) => ({ target: vault }));
  const { output: supply } = await sdk.api.abi.multiCall({
    calls,
    block: api.block,
    abi: "uint256:totalSupply",
    chain: "scroll",
  });

  const { output: exchangeRates } = await sdk.api.abi.multiCall({
    calls,
    block: api.block,
    abi: "uint256:exchangeRateStored",
    chain: "scroll",
  });

  const balances = {};
  supply.forEach(({ output }, i) => {
    const exchangeRate = new BigNumber(exchangeRates[i].output);
    const BASE = new BigNumber(10 ** 18);

    const tokenTVL = new BigNumber(output)
      .times(BASE)
      .div(exchangeRate)
      .toNumber();

    sdk.util.sumSingleBalance(balances, tokens[i], tokenTVL, "scroll");
  });

  return balances;
}

module.exports = {
  scroll: {
    tvl,
    borrowed,
    methodology: `We count the number of MINT and BORROW in the Scroll Rho Marketss Contracts`,
  },
};
