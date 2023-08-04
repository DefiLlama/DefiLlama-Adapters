const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");
const { request, gql } = require("graphql-request");
const { getBlock } = require("../helper/http");
//const tvlV1 = require('./v1')


const PREMIA_OPTIONS_CONTRACT_ETH =
  "0x5920cb60B1c62dC69467bf7c6EDFcFb3f98548c0";
const PREMIA_OPTIONS_CONTRACT_BSC =
  "0x8172aAC30046F74907a6b77ff7fC867A6aD214e4";

const erc20DAI = ADDRESSES.ethereum.DAI;
const erc20BUSD = ADDRESSES.bsc.BUSD;

const calcTvl = async (balances, chain, block, premiaOptionsContract) => {
  const erc20TokensLength = (
    await sdk.api.abi.call({
      abi: abi.tokensLength,
      target: premiaOptionsContract,
      block,
      ...(chain == "bsc" && { chain }),
    })
  ).output;

  for (let i = 0; i < erc20TokensLength; i++) {
    const erc20Tokens = (
      await sdk.api.abi.call({
        abi: abi.tokens,
        target: premiaOptionsContract,
        params: i,
        block,
        ...(chain == "bsc" && { chain }),
      })
    ).output;

    const erc20TokensBalance = (
      await sdk.api.erc20.balanceOf({
        target: erc20Tokens,
        owner: premiaOptionsContract,
        block,
        ...(chain == "bsc" && { chain }),
      })
    ).output;

    if (chain == "ethereum") {
      sdk.util.sumSingleBalance(balances, `${erc20Tokens}`, erc20TokensBalance);
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `bsc:${erc20Tokens}`,
        erc20TokensBalance
      );
    }
  }
};

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await calcTvl(balances, "ethereum", ethBlock, PREMIA_OPTIONS_CONTRACT_ETH);

  const erc20DAIBalance = (
    await sdk.api.erc20.balanceOf({
      target: erc20DAI,
      owner: PREMIA_OPTIONS_CONTRACT_ETH,
      ethBlock,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, erc20DAI, erc20DAIBalance);

  return balances;
};

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  await calcTvl(
    balances,
    "bsc",
    chainBlocks["bsc"],
    PREMIA_OPTIONS_CONTRACT_BSC
  );

  const erc20BUSDBalance = (
    await sdk.api.erc20.balanceOf({
      target: erc20BUSD,
      owner: PREMIA_OPTIONS_CONTRACT_BSC,
      block: chainBlocks["bsc"],
      chain: "bsc",
    })
  ).output;

  sdk.util.sumSingleBalance(balances, `bsc:${erc20BUSD}`, erc20BUSDBalance);

  return balances;
};

const getAddresses = gql`
  query TokenPairs(
    $block: Int
  ) {
    pools(
      first: 100
      where:  { optionType: CALL }
    ) {
      name
      address
      base {
        address
        symbol
      }
      underlying {
        address
        symbol
      }
    }
  }
`;

const chainToSubgraph = {
  ethereum: "https://api.thegraph.com/subgraphs/name/premiafinance/premiav2",
  arbitrum: "https://api.thegraph.com/subgraphs/name/premiafinance/premia-arbitrum",
  fantom: "https://api.thegraph.com/subgraphs/name/premiafinance/premia-fantom",
  optimism: "https://api.thegraph.com/subgraphs/name/premiafinance/premia-optimism",
}

function chainTvl(chain){
  return async (time, _ethBlock, chainBlocks)=>{
    const block = await getBlock(time, chain, chainBlocks, true)
    const {pools} = await request(chainToSubgraph[chain], getAddresses, {block})
    const balances = {}
    await sumTokens(balances,
      pools.map(p=>[p.underlying.address, p.address]).concat(pools.map(p=>[p.base.address, p.address])),
      block, chain, addr=>`${chain}:${addr}`)
    return balances
  }
}

module.exports = {
  ethereum: {
    tvl: sdk.util.sumChainTvls([chainTvl("ethereum"), ethTvl]),
    staking: stakings(["0x16f9d564df80376c61ac914205d3fdff7057d610", "0xF1bB87563A122211d40d393eBf1c633c330377F9"], "0x6399c842dd2be3de30bf99bc7d1bbf6fa3650e70")
  },
  bsc: {
    tvl: bscTvl,
  },
  arbitrum:{
    tvl: chainTvl("arbitrum")
  },
  fantom:{
    tvl: chainTvl("fantom")
  },
  optimism: {
    tvl: chainTvl("optimism")
  }
};
