var atob = require("atob"); // needed for decrypting values from contract
const utils = require('../helper/utils');
const BN = require("bignumber.js");
const web3 = require('../config/web3.js');
var UNISWAP_POOL = require("./UNISWAP_POOL.json")

const YieldlyUniswapPool = "0x6f9e023c0881ec3d8f56630a6c4fd137c025419e"

// No time travelling
async function algorand() {
    // Algorand token staked
    let algorandStaked = 0
    await utils.fetchURL('https://algoexplorerapi.io/v2/applications/233725844')
    .then(body => {
      body.data.params['global-state'].forEach((element) => {
        if (atob(element.key) == "GA") {
          algorandStaked = element.value.uint / 10**6
        }
      });
    })

    return {
        'algorand': algorandStaked
    }
}

async function getPriceOfYieldlyFromUniswap(pair) {
  let yieldlyPrice = 0;
  const ethPrice = (await utils.getPricesfromString('ethereum')).data.ethereum.usd
  let uniPairContractService = new web3.eth.Contract(UNISWAP_POOL, YieldlyUniswapPool);
  const poolReserves = await uniPairContractService.methods.getReserves().call();
  const yieldlySupply = new BN(poolReserves._reserve0);
  const ethSupply = new BN(poolReserves._reserve1);
  const priceInEth = ethSupply.div(yieldlySupply);
  yieldlyPrice = Number(priceInEth) * ethPrice;
  return yieldlyPrice;
};

async function stakingFetch() {
    let yieldlyPrice = await getPriceOfYieldlyFromUniswap(YieldlyUniswapPool)

    // amount ASA yieldly token staked
    let yieldlyStaked = 0

    await utils.fetchURL('https://algoexplorerapi.io/v2/applications/233725850')
    .then(body => {
        body.data.params['global-state'].forEach((element) => {
        if (atob(element.key) == "GA") {
            yieldlyStaked = element.value.uint / 10**6
        }
        });
    })

    return yieldlyPrice * yieldlyStaked
}

module.exports = {
  algorand: {
    tvl: algorand
  },
  staking:{
    fetch: stakingFetch
  },
  tvl: algorand,
}
