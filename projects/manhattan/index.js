const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { transformFantomAddress } = require("../helper/portedTokens");

var ifTokens = [
  "0xbb4F9c4CaE5D08AB0C02De724B3c51C28e8c181d",
  "0x00C38025F12F239B72dadc09a4B93F8830c462C0",
  "0x20FF28c943DE978dd7Ff3Af1f94a921A257cC7Cc",
  "0xacdAe58fA05cc449A6f099Cf42cF6a2C7A0317a6",
  "0x51086a97a72AB9a7022d5Cf3Fd2a5FeDE4d7bec8",
  "0x391E1bfc9851a518022815Fe786707c2E786f0Ca",
  "0x4Bbd947d5E04D6fC90eaeD18084B68F88279D73e",
  "0x29e65a3846AE97DD4A584C20383C53Bffe2a0130",
  "0x614062ED8b4dAc60DED33f357bA2A604F2C65D18",
  "0xF842F73e47A5f191deFb79e61E836545712144Ad",
  "0x522225662A7050D890cFe7D3Ecd49ac411f09c69",
  "0xF2486A76368463dd463188E6ba09A6C66E1c7479",
  "0x81c2DbE1Cd07539eB1104cd267Bec21800F3bC20",
];

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  let transform = await transformFantomAddress();

  const underlying = (
    await sdk.api.abi.multiCall({
      block,
      abi: abi.Token,
      calls: ifTokens.map((t) => ({
        target: t,
      })),
      chain: "fantom",
    })
  ).output.map((o) => o.output);

  const balance = (
    await sdk.api.abi.multiCall({
      block,
      abi: abi.checkInvestedLast,
      calls: ifTokens.map((t) => ({
        target: t,
      })),
      chain: "fantom",
    })
  ).output.map((o) => o.output);

  for (let i = 0; i < underlying.length; i++) {
    sdk.util.sumSingleBalance(
      balances,
      transform(underlying[i]),
      balance[i]
    );
  };

  return balances;
};

module.exports = {
  fantom: {
    tvl,
  },
};
