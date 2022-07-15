const { default: BigNumber } = require("bignumber.js");
const { getCoingeckoId } = require("../helper/solana");
const { fetchURL } = require('../helper/utils')

const HEDGE_API_URL = 'http://www.hedge.so/api/overview?mode=coingecko'

async function tvl() {
    const data = (await fetchURL(HEDGE_API_URL))?.data;
    const getCgId = await getCoingeckoId();
    
    const tvl = {
        'usd-coin': new BigNumber(0),
        'hedge-usd': new BigNumber(0),
    };

    //collateral
    for (const mint in data?.collateralHeld) {
        const cgId = await getCgId(mint);
        tvl[cgId] = new BigNumber(data.collateralHeld[mint])
    }

    //psm
    tvl['usd-coin'] = tvl['usd-coin'].plus(data?.psm?.deposited)

    //stability pool
    tvl['hedge-usd'] = tvl['hedge-usd'].plus(data?.liquidationPoolDeposits)

    return tvl;    
}

async function staking() {
    const data = (await fetchURL(HEDGE_API_URL))?.data;
    const staking = {
        'hedge-protocol': new BigNumber(data?.stakingPoolDeposits)
    }
    return staking;
} 

module.exports = {
    timetravel: false,
    solana:{
      tvl,
      staking
    },
    methodology:
      "TVL is calcuated as Collateral Value + Stability Pool Deposits * USH price + HDG Staked * HDG price"
  };