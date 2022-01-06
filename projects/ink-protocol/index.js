const {fetchURL} = require('../helper/utils');

async function tvl() {
  const url = 'https://fcd.terra.dev/wasm/contracts/terra19e99ksxaeefgf8lfcrn8pvu98emf3p0fhf9ujl/store?query_msg=%7B%22strategy%22:%7B%22sid%22:0%7D%7D'
  const tokens = await fetchURL(url)
  return {
    'terrausd': tokens.data.result.total_deposit.amount / 1e6
  }

}

module.exports = {
  methodology: 'TVL counts the UST that users deposited into Ink Protocol',
  terra: {
    tvl
  },
  tvl
}

