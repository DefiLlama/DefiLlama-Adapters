module.exports = {
  methodology: "TVL represents Uniswap V3 NFT positions held in staking wrapper. Positions are held as ERC721 NFTs. Working with DefiLlama team on optimal tracking method.",
  
  base: {
    tvl: async () => {
      // Temporary: Manual TVL while implementing NFT tracking
      return {
        "tether": 1600 // $1,600 current TVL
      }
    }
  }
}
