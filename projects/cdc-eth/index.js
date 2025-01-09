const token = '0x7a7c9db510ab29a2fc362a4c34260becb5ce3446'

module.exports = {
  cronos: {
    tvl: async (api) => ({
      ["cronos:" + token]: (await api.call({ target: token, abi: "erc20:totalSupply", }))
    })
  }
}