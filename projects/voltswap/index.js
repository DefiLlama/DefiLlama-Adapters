const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl');
module.exports = {
  meter:{
    tvl: calculateUsdUniTvl(
      "0x56aD9A9149685b290ffeC883937caE191e193135", 
      "meter", 
      "0x24aa189dfaa76c671c279262f94434770f557c35", 
      [
          "0x79a61d3a28f8c8537a3df63092927cfa1150fb3c",
          "0x228ebbee999c6a7ad74a6130e81b12f9fe237ba3",
      ], 
      "binance-usd"
      ),
  },
  theta:{
    tvl: calculateUsdUniTvl(
      "0xa2De4F2cC54dDFdFb7D27E81b9b9772bd45bf89d", 
      "theta", 
      "0x4dc08b15ea0e10b96c41aec22fab934ba15c983e", 
      [
          "0xe6a991ffa8cfe62b0bf6bf72959a3d4f11b2e0f5",
          "0x7b37d0787a3424a0810e02b24743a45ebd5530b2"
      ], 
      "theta-fuel"
      ),
  },
}
