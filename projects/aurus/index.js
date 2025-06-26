const ASSETS = [
  '0xe4a6f23fb9e00fca037aa0ea0a6954de0a6c53bf', // TXAU - gold
  '0x34abce75d2f8f33940c721dca0f562617787bff3', // TXAG - silver
  '0x19b22dbadc298c359a1d1b59e35f352a2b40e33c'  // TXPT - platinum
]

module.exports = {
  methodology: "TVL corresponds to the total amount of Assets minted",
  ethereum: {
    tvl: async (api) => {
      const totalSupplies = await api.multiCall({calls: ASSETS, abi: 'erc20:totalSupply'})
      api.add(ASSETS, totalSupplies)
    }
  }
}
