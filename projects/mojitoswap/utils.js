const { request, gql } = require("graphql-request");
const dayjs = require("dayjs");
const { toUSDTBalances } = require("../helper/balances");

const Ethers = require("ethers");
const MasterchefABI = require("./abi/masterchef.json");
const masterchefAddress = "0x25c6d6a65c3ae5d41599ba2211629b24604fea4f";
const masterchefV2Address = "0xfdfcE767aDD9dCF032Cbd0DE35F0E57b04495324";
const mjtAddress = "0x2ca48b4eea5a731c2b54e7c3944dbdb87c0cfb6f";
const erc20ABI = require("./abi/erc20.json");
const BigNumber = require("bignumber.js");

const {
  KCC_BLOCK_GRAPH,
  MJT_GRAPH,
  TOKEN_DATA,
  ETH_PRICE,
  GET_BLOCK,
} = require("./query");

const { JsonRpcProvider } = require("@ethersproject/providers");

async function getLatestBlock(timestamp) {
  //  a few blocks behind the blockchain,so we write a hack here
  const utcCurrentTime = timestamp ?? dayjs().unix();
  const res = await request(KCC_BLOCK_GRAPH, GET_BLOCK, {
    timestampFrom: utcCurrentTime,
    timestampTo: utcCurrentTime + 600,
  });

  const block =
    res?.blocks[0]?.number ?? (await getLatestBlock(dayjs().unix() - 600));
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

const getETHPrice = async (block) => {
  const result = await request(MJT_GRAPH, ETH_PRICE(block));
  return result?.bundles[0]?.ethPrice ? Number(result.bundles[0].ethPrice) : 0;
};

const getTokenPrice = async (token, block) => {
  const ethPrice = await getETHPrice(block);

  const tokens = await request(
    MJT_GRAPH,
    TOKEN_DATA(token.toLowerCase(), block),
    {
      id: token,
      block: block,
    }
  );

  const tokenPrice = tokens?.tokens[0]?.derivedETH
    ? tokens.tokens[0].derivedETH
    : 0;
  return ethPrice * tokenPrice;
};

const getStakeLockValue = () => {
  return (chain) => {
    return async (timestamp, ethBlock, chainBlocks) => {
      const block = await getLatestBlock(timestamp);
      const JSONProvider = new JsonRpcProvider(
        "https://rpc-mainnet.kcc.network",
        {
          name: "kcc",
          chainId: 321,
        }
      );

      const mjtContract = new Ethers.Contract(
        mjtAddress,
        erc20ABI,
        JSONProvider
      );

      const v1Balance = await mjtContract.balanceOf(masterchefAddress, {
        blockTag: block ?? "latest",
      });

      const v2Balance = await mjtContract.balanceOf(masterchefV2Address, {
        blockTag: block ?? "latest",
      });

      const v1MJTBalance = new BigNumber(v1Balance.toString())
        .div(10 ** 18)
        .toNumber();

      const v2MJTBalance = new BigNumber(v2Balance.toString())
        .div(10 ** 18)
        .toNumber();

      const mjtPrice = await getTokenPrice(mjtAddress, block);
      const stakeLockValue = (v1MJTBalance + v2MJTBalance) * mjtPrice;
      return toUSDTBalances(stakeLockValue);
    };
  };
};

module.exports = {
  getChainTvl,
  getStakeLockValue,
};
