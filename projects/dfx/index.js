const {tokenHolderBalances} = require('../helper/tokenholders')

const tvl = tokenHolderBalances([
    {
      tokens: [
        "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
        "0xcadc0acd4b445166f12d2c07eac6e2544fbe2eef", // CADC
        "0xdb25f211ab05b1c97d595516f45794528a807ad8", // EURS
        "0x70e8de73ce538da2beed35d14187f6959a8eca96", // XSGD
      ],
      holders: [
        // v0 pools
        "0x77e8560bc23fdf3c7a93c6f8e6c295d6088a9889", // CADC-USDC pool
        "0x249dda6b483f3fde86cd1937e825f0901c1151f3", // EURS-USDC pool
        "0x78c281090399ebc2d720595654b908ed31cd8bcb", // XSGD-USDC pool
        // v0.5 / v1.0 pools
        "0xa6c0cbcaebd93ad3c6c94412ec06aaa37870216d", // CADC-USDC pool
        "0x1a4ffe0dcbdb4d551cfca61a5626afd190731347", // EURS-USDC pool
        "0x2bab29a12a9527a179da88f422cdaaa223a90bd5", // XSGD-USDC pool
      ],
    },
  ]
)

module.exports = {
    ethereum: {
        tvl
    },
    tvl
}
