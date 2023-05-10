const axios = require("axios");
const BigNumber = require('bignumber.js');
const { GraphQLClient, gql } = require('graphql-request');

const PRICE_API = 'https://4avzt2764b.execute-api.us-east-1.amazonaws.com/dev/api/';
const ETHOS_SUBGRAPH = 'https://api.thegraph.com/subgraphs/name/munchies69/ethos-reserve';

function safeAdd(a, b) {
  const bigA = new BigNumber(a);
  const bigB = new BigNumber(b);
  const bigSum = bigA.plus(bigB);
  return bigSum.toString();
}
function safeMult(a, b) {
  const bigA = new BigNumber(a);
  const bigB = new BigNumber(b);
  const bigProduct = bigA.multipliedBy(bigB);
  return bigProduct.toString();
}
function safePow(a, b) {
  const bigA = new BigNumber(a);
  const bigB = new BigNumber(b);
  const bigProduct = bigA.exponentiatedBy(bigB);
  return bigProduct.toString();
}


async function getCoinPricesFromApi (coinAddrs, chainId) {
  const priceApiClient = axios.create({
    baseURL: PRICE_API,
    responseType: 'json',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  let allCoinsQuery = '';
  let queries = [];
  coinAddrs.forEach((coinAddr, index) => {
    const coinQuery = coinAddr + ':' + chainId;
    queries.push(coinAddr + ':' + chainId);
    allCoinsQuery += coinQuery;
    if (index !== coinAddrs.length-1) {
      allCoinsQuery += '&'
    }
  });
  try {
    const responseRaw = await priceApiClient.get('/prices/tokens/'+allCoinsQuery);
    const response = responseRaw.data.data;
    let prices = [];
    queries.forEach((query) => {
      const foundPrice = response[query];
      if (foundPrice !== undefined) {
        prices.push(foundPrice)
      }
    })
    return prices;
  } catch(err) {
    return undefined;
  }
}

async function getSubgraphPoolData() { //formerly getAllPoolData
  const subgraphClient = new GraphQLClient(ETHOS_SUBGRAPH, { headers: {} })

  try {
    const queryResult = await subgraphClient.request(
      gql`
        query {
          globals(first: 1) {
            currentSystemState{
              totalLQTYTokensStaked
              tokensInStabilityPoolContract
            }
            currentSystemStateCollateralData{
              collateralAddress
              price
              totalCollateral
              totalDebt
              totalCollateralRatio
              collSurplusPoolBalance
            }
          }
        }
      `,
    );
    return queryResult;
  } catch (error) {
  }
}

const getPoolStats = async (stakingAndStabilityPrices) => {

  const parseTroveData = (data) => {
    const opAddr = '0x4200000000000000000000000000000000000042';
    const ethAddr = '0x4200000000000000000000000000000000000006';
    const btcAddr = '0x68f180fcCe6836688e9084f035309E29Bf0A2095';
    let opTotalValue = '';
    let ethTotalValue = '';
    let btcTotalValue = '';
    if (opAddr !== undefined && ethAddr !== undefined && btcAddr !== undefined) {
      data.forEach((coin) => {
        if (coin.collateralAddress.toLowerCase() === opAddr.toLowerCase()) {
          opTotalValue = safeMult(coin.totalCollateral, coin.price);
        } else if (coin.collateralAddress.toLowerCase() === ethAddr.toLowerCase()) {
          ethTotalValue = safeMult(coin.totalCollateral, coin.price);
        } else if (coin.collateralAddress.toLowerCase() === btcAddr.toLowerCase()) {
          const decimalMover = safePow('10', '10');
          const formattedBtcAmount = safeMult(coin.totalCollateral, decimalMover);
          btcTotalValue = safeMult(formattedBtcAmount, coin.price);
        }
      });
    }
    return {
      op: opTotalValue,
      eth: ethTotalValue, 
      btc: btcTotalValue,
    }
  }
  const parseNonTroveData = (data, tokenPrices) => {
    if (tokenPrices !== undefined && tokenPrices.stability !== '' && tokenPrices.staking !== '') {
      const stakingTotalValue = safeMult(tokenPrices.staking, data.totalLQTYTokensStaked);
      const stabilityTotalValue = safeMult(tokenPrices.stability, data.tokensInStabilityPoolContract);
      return {
        stakingPool: stakingTotalValue,
        stabilityPool: stabilityTotalValue,
      }
    }
  }

  try {
    const rawRes = await getSubgraphPoolData();
    if (rawRes !== undefined) {
      const nonTrovesRaw = rawRes.globals[0].currentSystemState;
      const trovesRaw = rawRes.globals[0].currentSystemStateCollateralData;

      const troves = parseTroveData(trovesRaw);
      const nonTroves = parseNonTroveData(nonTrovesRaw, stakingAndStabilityPrices)

      return {
        ...troves,
        ...nonTroves,
      }
    }
  } catch (error) {

  }
}

function fetchTvl() {
  return async() => {
    const addresses = {
      op: '0x4200000000000000000000000000000000000042',
      eth: '0x4200000000000000000000000000000000000006',
      btc: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      boath: '0xd20f6F1D8a675cDCa155Cb07b5dC9042c467153f',
      ern: '0xc5b001DC33727F8F26880B184090D3E252470D45',
    }

    const response = await getCoinPricesFromApi([addresses.ern, addresses.boath], '0xa');

    let stabilityTokenPrice = '';
    let stakingTokenPrice = ''

    response?.forEach((coin) => {
      if (coin.address.toLowerCase() === addresses.ern.toLowerCase()) {
        stabilityTokenPrice = coin.price;
      } else if (coin.address.toLowerCase() === addresses.boath.toLowerCase()) {
        stakingTokenPrice = coin.price;
      }
    });

    const allTvls = await getPoolStats({staking:stakingTokenPrice, stability: stabilityTokenPrice});

    let total = '0'
    for (const key in allTvls) {
      total = safeAdd(total, allTvls[key]);
    }

    return { tether: +total };
  }
}

module.exports = {
  misrepresentedTokens: false,
  methodology: `TVL is fetched from the Ethos Reserve subgraph and the Byte Masons token price api.`,
  timetravel: false,
  optimism: {
    tvl: fetchTvl()
  },
}
