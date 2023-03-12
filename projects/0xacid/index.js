const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");

const abi = {
  uniV2GetReserves: "function getReserves() view returns (uint112 _reserve0, uint112 _reserve1)"
};

const ETH_USD_PAIR = "0xCB0E5bFa72bBb4d16AB5aA0c60601c438F04b4ad";
const ACID_ETH_PAIR = "0x73474183a94956CD304c6c5A504923D8150bd9CE";
const ACID_STAKING = "0x00a842038a674616f6a97e62f80111a536778282";
const ACID_TOKEN = "0x29C1EA5ED7af53094b1a79eF60d20641987c867e";
const USDT_ADDRESS = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9";

async function tvl(timestamp, block, _, { api }) {
  const balance = {};
  // const reserves = (await sdk.api.abi.multiCall({
  //   calls: [
  //     { target: ETH_USD_PAIR },
  //     { target: ACID_ETH_PAIR }
  //   ],
  //   abi: abi.uniV2GetReserves,
  //   block,
  //   chain: "arbitrum"
  // })).output;

  // const price = reserves[0].output[1] / reserves[0].output[0] * (reserves[1].output[1] / reserves[1].output[0]);

  const staked = (await sdk.api.abi.call({
    abi: "erc20:balanceOf",
    target: ACID_TOKEN,
    params: [ACID_STAKING],
    chain: "arbitrum",
    block
  })).output;

  // const tvl = staked * price;
  sdk.util.sumSingleBalance(balance, ACID_TOKEN, staked, api.chain);
  return balance;
}

module.exports = {
  timetravel: true,
  start: 1678417200,
  arbitrum: {
    tvl: () => ({}),
    staking: tvl
  },
}