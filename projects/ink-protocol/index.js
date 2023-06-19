const {fetchURL} = require('../helper/utils');

async function tvl() {
  const coreUrl = 'https://lcd.terra.dev/wasm/contracts/terra1nlsfl8djet3z70xu2cj7s9dn7kzyzzfz5z2sd9/store?query_msg=%7B%22strategy%22:%7B%22sid%22:0%7D%7D'
  const interestUrl = 'https://lcd.terra.dev/wasm/contracts/terra1v579mvp2xxw3st7glgaurfla5pxses0jdwedde/store?query_msg=%7B%22total_vault_info%22:%7B%7D%7D'

  const core = await fetchURL(coreUrl)
  const interest = await fetchURL(interestUrl)

  return {
    'terrausd': (core.data.result.total_deposit.amount / 1e6) + (interest.data.result.anchor / 1e6)
  }
}

module.exports = {
  methodology: 'TVL counts the UST that users deposited into Ink Protocol',
  terra: {
    tvl: () => ({}),
  },
  hallmarks:[
    [1651881600, "UST depeg"],
  ]
}

