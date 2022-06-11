const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const sdk = require('@defillama/sdk')
const masterchefAddress = "0x25c6d6a65c3ae5d41599ba2211629b24604fea4f";
const masterchefV2Address = "0xfdfcE767aDD9dCF032Cbd0DE35F0E57b04495324";
const mjtAddress = "0x2ca48b4eea5a731c2b54e7c3944dbdb87c0cfb6f";

const {
  KCC_BLOCK_GRAPH,
  GET_BLOCK,
} = require("./query");

async function getLatestBlock(timestamp) {
  //  a few blocks behind the blockchain,so we write a hack here
  const unixTimeNow = Math.floor(Date.now()/1000)
  const utcCurrentTime = timestamp ?? unixTimeNow;
  const res = await request(KCC_BLOCK_GRAPH, GET_BLOCK, {
    timestampFrom: utcCurrentTime,
    timestampTo: utcCurrentTime + 600,
  });

  const block =
    res?.blocks[0]?.number ?? (await getLatestBlock(unixTimeNow - 600));
  return Number(block);
}

function getChainTvl(
  graphUrls,
  factoriesName = "uniswapFactories",
  tvlName = "totalLiquidityUSD"
) {
  const graphQuery = gql`
query get_tvl($block: Int) {
  ${factoriesName}(
    block: { number: $block }
  ) {
    ${tvlName}
  }
}
`;

  return (chain) => {
    return async (timestamp, ethBlock, chainBlocks) => {
      const block = await getLatestBlock(timestamp);
      const uniswapFactories = (
        await request(graphUrls[chain], graphQuery, {
          block,
        })
      )[factoriesName];
      const usdTvl = Number(uniswapFactories[0][tvlName]);
      return toUSDTBalances(usdTvl);
    };
  };
}

const getStakeLockValue = () => {
  return (chain) => {
    return async (timestamp, ethBlock, chainBlocks) => {
      const {output: mjBalances} = await sdk.api.abi.multiCall({
        calls: [masterchefAddress, masterchefV2Address].map(i => ({ params: i})),
        target: mjtAddress,
        abi: 'erc20:balanceOf',
        block: chainBlocks.kcc,
        chain: 'kcc',
      })

      let total = 0
      mjBalances.forEach(({ output }) => total += +output)

      return {
        mojitoswap: total / 1e18
      };
    };
  };
};

module.exports = {
  getChainTvl,
  getStakeLockValue,
};
