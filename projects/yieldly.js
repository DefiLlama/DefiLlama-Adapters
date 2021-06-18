var atob = require("atob"); // needed for decrypting values from contract
var nodeFetch = require("node-fetch");
const BN = require("bignumber.js");
const web3 = require('./config/web3.js');
var UNISWAP_POOL = require("./config/yieldly/UNISWAP_POOL.json")

async function fetch() {

  // Total TVL
  let tvl = 0 

  const YieldlyUniswapPool = "0x6f9e023c0881ec3d8f56630a6c4fd137c025419e"
  const YieldlyAlgorandToken = "233725844"
  let ethPrice = 0

  // START ALGORAND TVL

  let algorandStaked = 0
  await nodeFetch('https://algoexplorerapi.io/v2/applications/' + YieldlyAlgorandToken)
  .then(res => res.text())
  .then(body => {
    JSON.parse(body).params['global-state'].forEach((element) => {
      if (atob(element.key) == "GA") {
        algorandStaked = element.value.uint / 10**6
      }
    });
  })
  let algoPrice = 0
  await nodeFetch('https://api.coingecko.com/api/v3/simple/price?ids=algorand,ethereum&vs_currencies=usd')
    .then(res => res.text())
    .then(body => {
      algoPrice = JSON.parse(body).algorand.usd
      ethPrice = JSON.parse(body).ethereum.usd
    })

    tvl = tvl + (algorandStaked * algoPrice)

    // END ALGO CALCULATION


    // START YIELDLY TOKEN TVL

    async function getPriceOfYieldlyFromUniswap(pair) {
      let yieldlyPrice = 0;
      let uniPairContractService = new web3.eth.Contract(UNISWAP_POOL, YieldlyUniswapPool);
      const poolReserves = await uniPairContractService.methods.getReserves().call();
      const yieldlySupply = new BN(poolReserves._reserve0);
      const ethSupply = new BN(poolReserves._reserve1);
      const priceInEth = ethSupply.div(yieldlySupply);
      yieldlyPrice = Number(priceInEth) * ethPrice;
      return yieldlyPrice;
    };

    // USD price of yieldly (no coingecko yet)
    let yieldlyPrice = await getPriceOfYieldlyFromUniswap(YieldlyUniswapPool)

    // amount ASA yieldly token staked
    let yieldlyStaked = 0

    await nodeFetch('https://algoexplorerapi.io/v2/applications/233725850')
      .then(res => res.text())
      .then(body => {
        JSON.parse(body).params['global-state'].forEach((element) => {
          if (atob(element.key) == "GA") {
            yieldlyStaked = element.value.uint / 10**6
          }
        });
      })
    
    let stakedYieldly = yieldlyStaked * yieldlyPrice
    tvl = tvl + stakedYieldly

    // END YIELDLY TVL
    // console.log(tvl)
    return tvl
}

module.exports = {
    fetch
}