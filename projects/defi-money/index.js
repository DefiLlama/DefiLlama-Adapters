const { sumTokens2 } = require("../helper/unwrapLPs")

const config = {
  optimism: {
    controller: "0x1337F001E280420EcCe9E7B934Fa07D67fdb62CD",
    MONEY: "0x7e803F4edd6528caFBf5C5d03Cc106b04379C24b",
    stakeLPs: [
      // "0x7e803F4edd6528caFBf5C5d03Cc106b04379C24b", // MONEY - already included in tvl
      "0xE8f00491afa68B4A653C77e5f92DBA0F8df3a185", // crvUSD/MONEY
      "0xa398a48C2738fd6c79F5654823Fb93456B0fDaF6", // USDT/MONEY
      "0x36afCD1083eE9186A2b984E10d75C1E14b99B75e", // USDC/MONEY
      "0xcf38a66DeD7825cfEF66046c256Aa0EDbd41BEf5", // DAI/MONEY
      "0x73C3eC2b8e00929824a529e60fb6ed8aF193c7cc", // FRAX/MONEY
    ],
  },
  arbitrum: {
    controller: "0x1337F001E280420EcCe9E7B934Fa07D67fdb62CD",
    MONEY: "0xEbE54BEE7A397919C53850bA68E126b0A6b295ed",
    stakeLPs: [
      // "0xEbE54BEE7A397919C53850bA68E126b0A6b295ed", // MONEY - already included in tvl
      "0xF2852d7e810d3EC7094bFE1D7DDCa5044c259c25", // crvUSD/MONEY
      "0x6e59b326984fC132F16a977cd20E38641A9043De", // USDT/MONEY
      "0xdE718A791226c93B53C77D60E5D4693C05a31422", // USDC/MONEY
      "0xE3763d545707F435e21eeBbe75070495c806B744", // DAI/MONEY
      "0x07aDF588508b923B8eA0389d27b61b9CB8a197Cb", // FRAX/MONEY
    ],
  },
  base: {
    controller: "0x1337F001E280420EcCe9E7B934Fa07D67fdb62CD",
    MONEY: "0xEbE54BEE7A397919C53850bA68E126b0A6b295ed",
    stakeLPs: [
      // "0x9F04112af02CE57C10d946481Ea06373719c1E7E", // MONEY - already included in tvl
      "0xe0f7c023763d782970ab45e9232255a64290cd6a", // crvUSD/MONEY
      "0xb7698c690752ae034e914a29a0de67339a94982b", // USDC/MONEY
      "0x45acdee3c9f7e1c7ad6cc10c9cb9f74eb52d0e70", // USDbC/MONEY
      "0xac786337dde86b768ea3cc90afa03250bccfff28", // DAI/MONEY
    ],
  },
}

const tvl = async (api) => {
  const { controller, } = config[api.chain]
  const colls = await api.call({ target: controller, abi: 'address[]:get_all_collaterals' })
  const amms = await api.multiCall({  abi: 'function get_amm(address) view returns (address)', calls: colls, target: controller })
  return sumTokens2({ api, tokensAndOwners2: [colls, amms]})
}

const pool2 = async (api) => {
  const { stakeLPs = [], } = config[api.chain]
  const tokens = await api.multiCall({  abi: 'address:STAKE_TOKEN', calls: stakeLPs })
  return sumTokens2({ api, tokensAndOwners2: [tokens, stakeLPs]})
}

module.exports = {
  methodology: "TVL corresponds to the collateral deposited in the markets",
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl, pool2,
  }
})
