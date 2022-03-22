const {fetchURL} = require('../helper/utils');

async function tvl() {
  const url = 'https://fcd.terra.dev/wasm/contracts/terra1nlsfl8djet3z70xu2cj7s9dn7kzyzzfz5z2sd9/store?query_msg=%7B%22strategy%22:%7B%22sid%22:0%7D%7D'
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
}

