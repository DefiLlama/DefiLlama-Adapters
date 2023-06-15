// https://www.starknetjs.com/docs/API/contract

const BN = require("bn.js");
const { multiCall, parseAddress } = require("../helper/chain/starknet");
const abi = require("./abi");

const amm =
  "0x076dbabc4293db346b0a56b29b6ea9fe18e93742c73f12348c8747ecfc1050aa";
const twoPow61 = new BN(2).pow(new BN(61));
const tenPowN = (n) => new BN(10).pow(new BN(n));

const pools = [
  // EthUsdcCall pool
  {
    address:
      "0x7aba50fdb4e024c1ba63e2c60565d0fd32566ff4b18aa5818fc80c30e749024",
    token: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    decimals: 18,
  },
  // EthUsdcPut pool
  {
    address:
      "0x18a6abca394bd5f822cfa5f88783c01b13e593d1603e7b41b00d31d2ea4827a",
    token: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    decimals: 6,
  },
];

async function tvl(_, _1, _2, { api }) {
  const calls = pools.map((pool) => ({
    params: [parseAddress(pool.address)],
  }));

  const [unlocked_capitals, pool_positions] = await Promise.all([
    multiCall({ abi: abi.get_unlocked_capital, target: amm, calls }),
    multiCall({
      abi: abi.get_value_of_pool_position,
      target: amm,
      calls,
    }),
  ]);

  pools.forEach((pool, i) => {
    // pool TVL is unlocked capital in the pool + position of the pool
    // the position is in Math64x61, therefore:
    // TVL = unlocked + pool_position * 10**decimals / 2**61
    const poolTvl = unlocked_capitals[i].add(
      pool_positions[i].mul(tenPowN(pool.decimals)).div(twoPow61)
    );
    api.add(pool.token, poolTvl);
  });
}

module.exports = {
  methodology: 'Sums the unlocked capital and position of each pool.',
  starknet: {
    tvl,
  },
};
