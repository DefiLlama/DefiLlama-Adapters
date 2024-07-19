const { staking } = require("../helper/staking.js")
const { joeV2Export } = require('../helper/traderJoeV2')

module.exports = joeV2Export({
  avax: '0x8e42f2F4101563bF679975178e880FD87d3eFd4e',
  arbitrum: '0x8e42f2F4101563bF679975178e880FD87d3eFd4e',
  bsc: '0x8e42f2F4101563bF679975178e880FD87d3eFd4e',
  ethereum: '0xDC8d77b69155c7E68A95a4fb0f06a71FF90B943a',
})

module.exports.arbitrum.staking = staking("0x43646A8e839B2f2766392C1BF8f60F6e587B6960", "0x371c7ec6D8039ff7933a2AA28EB827Ffe1F52f07")