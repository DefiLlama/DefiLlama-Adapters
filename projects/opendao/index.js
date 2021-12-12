const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const vaults = [
  "0x0a234ef34614a4eed1c1430a23b46f95df5f4257", // pOPEN
  "0xfff0cc78a7e7ce5d6ba60f23628ff9a63beee87f", // OCP
  "0x09139d7343953163eacde83845b342c1d08999ef", // LIME
  "0xd90ec012a6b2b549dd2a74024f1e025d0801696c", // LAND
  "0xcfefc606c4c010c242431f60a7afc13461df399c", // ROSEN
];

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  let underlying = (
    await sdk.api.abi.multiCall({
      calls: vaults.map((p) => ({
        target: p,
      })),
      abi: abi.underlying,
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  let underlyingBalances = (
    await sdk.api.abi.multiCall({
      calls: underlying.map((p) => ({
        target: p.output,
        params: p.input.target,
      })),
      abi: "erc20:balanceOf",
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  underlyingBalances.forEach((p) => {
    sdk.util.sumSingleBalance(balances, `bsc:${p.input.target}`, p.output);
  });
  return balances;
}

module.exports = {
  methodology:
    "TVL consists of underlying tokens in vaults used as collateral to mint USDO",
  bsc: {
    tvl,
  },
};
