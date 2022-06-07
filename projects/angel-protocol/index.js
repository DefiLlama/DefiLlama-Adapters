
const { fetchURL } = require('../helper/utils')
const BigNumber = require('bignumber.js');


async function tvl() {
  const res = await fetchURL(`https://fcd.terra.dev/wasm/contracts/terra172ue5d0zm7jlsj2d9af4vdff6wua7mnv6dq5vp/store?query_msg=%7B%22token_info%22:%7B%22sid%22:0%7D%7D`)
  return {
    'anchorust': BigNumber(res.data.result.total_supply) / 1e6,
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL takes total apANC in the contract and returns AnchorUST value',
  terra: {
    tvl,
  }
}