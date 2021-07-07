const { default: BigNumber } = require("bignumber.js");
const { request, gql } = require("graphql-request");

const graphUrl = 'https://graph.mirror.finance/graphql'
const mirLiquidityQuery = gql`
query liq($network: Network){
  assets{
    token
    symbol
    statistic{
      liquidity(network: $network)
    }
  }
}
`;

const tvlQuery = gql`
query statistic{
  statistic{
    totalValueLocked {
      total
      collateral
      liquidity
    }
    collateralRatio
  }
}
`

const ust = val=>Number(val)*1e12
const fixed = val=>BigNumber(val).toFixed(0)

function getMirLiquidity(network){
  return request(
    graphUrl,
    mirLiquidityQuery,
    {
      network,
    }
  ).then(data=> data.assets);
}

const getTotalLiq = assets => assets.reduce((acc, asset)=>acc+ust(asset.statistic.liquidity), 0)
const getPool2Liq = liq => ust(liq.find(asset=>asset.symbol==="MIR").statistic.liquidity)
const ustAddress = "0xa47c8bf37f92abed4a126bda807a7b7498661acd"

async function terraPool2() {
  const pool2TerraLiq = getPool2Liq(await getMirLiquidity('TERRA'))
  return {
    [ustAddress] : fixed(pool2TerraLiq),
  }
}

async function ethereumPool2() {
  const pool2EthLiq = getPool2Liq(await getMirLiquidity('ETH'))
  return {
    [ustAddress] : fixed(pool2EthLiq),
  }
}

async function terraTvl() {
  const totalTvl = request(graphUrl,tvlQuery).then(data=>ust(data.statistic.totalValueLocked.total))
  const ethLiquidity = getMirLiquidity('ETH')
  const terraLiquidity = getMirLiquidity('TERRA')
  const totalEthLiquidity = getTotalLiq(await ethLiquidity)
  const pool2TerraLiq = getPool2Liq(await terraLiquidity)

  return {
    [ustAddress] : fixed((await totalTvl)-totalEthLiquidity-pool2TerraLiq),
  }
}

async function ethereumTvl() {
  const ethLiquidity = getMirLiquidity('ETH')
  const totalEthLiquidity = getTotalLiq(await ethLiquidity)
  const pool2EthLiq = getPool2Liq(await ethLiquidity)

  return {
    [ustAddress]: fixed(totalEthLiquidity-pool2EthLiq)
  }
}

const getTvl = balances => Number(balances[ustAddress])
async function tvl(timestamp, block) {
  const eth = getTvl(await ethereumTvl())
  const terr = getTvl(await terraTvl())
  return {
    [ustAddress]: fixed(eth+terr)
  }
}


module.exports = {
  tvl,
  ethereum: {
    tvl: ethereumTvl,
    pool2: ethereumPool2
  },
  terra: {
    tvl: terraTvl,
    pool2: terraPool2
  }
}