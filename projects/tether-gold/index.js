// XAUt is natively issued on Ethereum only.
//
// XAUt0 on other chains - and the BSC token 0x21cAef8A43163Eea865baeE23b9C2E327696A3bf that
// keeps the plain "XAUt" symbol - are LayerZero OFTs minted against XAUt locked in the Ethereum
const XAUt = '0x68749665ff8d2d112fa859aa293f07a622782f38'

module.exports = {
  methodology: "Counts the total supply of XAUt on Ethereum, the only native Tether Gold issuance. XAUt0 on other chains is a LayerZero wrapper backed 1:1 by XAUt locked in the Ethereum OAdapter.",
  ethereum: {
    tvl: async (api) => {
      const totalSupply = await api.call({ target: XAUt, abi: 'erc20:totalSupply' })
      api.add(XAUt, totalSupply)
    },
  },
}
