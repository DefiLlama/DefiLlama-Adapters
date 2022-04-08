// const utils = require('../helper/utils');
// const {toUSDTBalances} = require('../helper/balances');
const sdk = require("@defillama/sdk");
const { calculateUniTvl } = require("../helper/calculateUniTvl");

// const baseURL = 'https://api.latteswap.com/api'
// async function fetch() {
//   const totalTvl = await utils.fetchURL(`${baseURL}/v1/amm/defi-llama/tvl-exclude-latte`)
//   return Number(totalTvl.data)
// }

// async function staking() {
//   const latteTvl = await utils.fetchURL(`${baseURL}/v1/amm/defi-llama/tvl-latte-pool`)
//   return toUSDTBalances(Number(latteTvl.data))
// }

const factory = "0x4DcE5Bdb81B8D5EdB66cA1b8b2616A8E0Dd5f807";
const latteToken = "0x8D78C2ff1fB4FBA08c7691Dfeac7bB425a91c81A";
const lattev2Token = "0xa269A9942086f5F87930499dC8317ccC9dF2b6CB";
const masterchef = "0xbCeE0d15a4402C9Cc894D52cc5E9982F60C463d6";
const translate = {
  "0x8d78c2ff1fb4fba08c7691dfeac7bb425a91c81a":
    "bsc:0xa269a9942086f5f87930499dc8317ccc9df2b6cb", // LATTE to LATTEv2
};

async function tvl(timestamp, block, chainBlocks) {
  return await calculateUniTvl(
    (addr) => {
      if (translate[addr.toLowerCase()] !== undefined) {
        return translate[addr];
      }
      return `bsc:${addr}`;
    },
    chainBlocks.bsc,
    "bsc",
    factory,
    0,
    true
  );
}

async function staking(timestamp, block, chainBlocks) {
  let balances = {};
  let stakingBalances = (
    await sdk.api.abi.multiCall({
      calls: [
        {
          target: latteToken,
          params: masterchef,
        },
        {
          target: lattev2Token,
          params: masterchef,
        },
      ],
      abi: "erc20:balanceOf",
      block: chainBlocks.bsc,
      chain: "bsc",
    })
  ).output;
  stakingBalances.forEach((p) => {
    sdk.util.sumSingleBalance(balances, `bsc:${lattev2Token}`, p.output);
  });
  return balances;
}

module.exports = {
  bsc: {
    tvl,
    staking,
  },
  tvl,
};
