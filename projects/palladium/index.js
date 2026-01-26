const { sumTokens2 } = require("../helper/unwrapLPs")

const ADMIN_ADDRESSES = {
  btnx: "0x741145aF40A46cD8B7653Be09EC59CEb9c6c45e1"
}

async function tvl(api) {
  const adminContract = ADMIN_ADDRESSES[api.chain];
  const collAddresses = await api.call({ abi: "address[]:getValidCollateral", target: adminContract, })
  const activePool = await api.call({ abi: "address:activePool", target: adminContract, })
  await sumTokens2({ api, tokens: collAddresses, owner: activePool, })
}

module.exports = {
  methodology: "Adds up the total value locked as collateral on the Palladium protocol",
}

Object.keys(ADMIN_ADDRESSES).forEach((chain) => {
  module.exports[chain] = { tvl }
})