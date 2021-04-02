const { request, gql } = require("graphql-request");
const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js")

const graphUrl = 'https://api.thegraph.com/subgraphs/name/renproject/renvm'
const graphQuery = gql`
query get_tvl($block: Int) {
  assets(
    block: { number: $block }
  ) {
    priceInUsd
    symbol
    tokenAddress
  }
}
`;
const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const darkNodeStakingContract = "0x60Ab11FE605D2A2C3cf351824816772a131f8782";
const renToken = '0x408e41876cCCDC0F92210600ef50372656052a38'

async function tvl(timestamp, block) {
  const balances = {}
  const {assets} = await request(
    graphUrl,
    graphQuery,
    {
      block,
    }
  );
  const assetCalls = assets.map(asset=>({
    target: asset.tokenAddress
  }))
  const decimals = sdk.api.abi.multiCall({
    abi: 'erc20:decimals',
    block,
    calls: assetCalls
  });
  const totalSupplies = sdk.api.abi.multiCall({
    abi: 'erc20:totalSupply',
    block,
    calls: assetCalls
  });
  const stakedRen = await sdk.api.abi.call({
    target: renToken,
    abi: 'erc20:balanceOf',
    params: [darkNodeStakingContract],
    block
  });
  balances[renToken] = stakedRen.output;

  const resolvedDecimals = (await decimals).output;
  const resolvedSupplies = (await totalSupplies).output
  const assetsUsdTvl = assets.reduce((acc, asset, index)=>{
    const dec = Number(resolvedDecimals[index].output)
    const supply = BigNumber(resolvedSupplies[index].output)
    const usdAmount = supply.div(BigNumber(10).pow(dec)).times(asset.priceInUsd).toNumber()
    return acc + usdAmount;
  }, 0)
  balances[usdtAddress]= (assetsUsdTvl * 1e6).toFixed(0)

  return balances
}

module.exports = {
  name: 'REN',
  token: 'REN',
  category: 'Assets',
  start: 0, // WRONG!
  tvl
}