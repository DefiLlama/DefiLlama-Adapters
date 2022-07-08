const { get } = require("../helper/http")
const { toUSDTBalances } = require("../helper/balances")
let _response

async function getTvls(serviceName, key) {
  if (!_response) _response = get('https://api.stkr.io/v1alpha/metrics')
  const response = await _response
  const data = response.services.find(i => i.serviceName === serviceName)
  return data ? +data[key] : 0;
}

async function getETHTvl() {
  return {
    ethereum: await getTvls("eth", "totalStaked"),
    'matic-network': await getTvls("polygon", "totalStaked"),
  }
}

async function getBscTvl() {
  return {
    binancecoin: await getTvls("bnb", "totalStaked"),
  }
}

async function getAvaxTvl() {
  return {
    'avalanche-2': await getTvls("avax", "totalStaked"),
  }
}

async function polkadot() {
  return {
    polkadot: await getTvls("dot", "totalStaked"),
  }
}

async function ksm() {
  return {
    kusama: await getTvls("ksm", "totalStaked"),
  }
}

async function getFantomTvl() {
  return {
    fantom: await getTvls("ftm", "totalStaked"),
  }
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: getETHTvl,
  },
  bsc: {
    tvl: getBscTvl,
  },
  avalanche: {
    tvl: getAvaxTvl,
  },
  fantom: {
    tvl: getFantomTvl,
  },
  polkadot: {
    tvl: polkadot,
  },
  kusama: {
    tvl: ksm,
  },
  methodology: `We get the total staked amount and total staked USD from Ankr's official API.`,
};
