const { fetchURL } = require('../helper/utils')

async function tvl() {
  const res = await fetchURL(
    `https://lcd.terra.dev/wasm/contracts/terra1xw3h7jsmxvh6zse74e4099c6gl03fnmxpep76h/store?query_msg=%7B%22state%22%3A%20%7B%7D%7D`
  )

  return {
    "terra-luna": res.data.result.total_bond_amount / 1e6,
  }
}

async function staking() {
  const staked = await fetchURL(
    `https://lcd.terra.dev/wasm/contracts/terra1042wzrwg2uk6jqxjm34ysqquyr9esdgm5qyswz/store?query_msg=%7B%22token_info%22%3A%20%7B%7D%7D`
  )

  return {
    "prism-governance-token": Number(staked.data.result.total_supply) / 1e6
  }
}

module.exports = {
  timetravel: false,
  terra: {
    tvl,
    staking,
  }
}