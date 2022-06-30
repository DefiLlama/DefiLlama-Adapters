const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  methodology: "Factory addresses (0x30D70fFBbfD795B147842100be5564502285E31F for kava) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  kava: {
    tvl: getUniTVL({
      factory: '0x30D70fFBbfD795B147842100be5564502285E31F',
      chain: 'kava',
      coreAssets: [
        '0x88905056caCBb5554Add698204B6a757BEcA278D',
        "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b",
        "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
        "0xB44a9B6905aF7c801311e8F4E76932ee959c663C",
        "0x65e66a61D0a8F1e686C2D6083ad611a10D84D97A",
        "0x765277EebeCA2e31912C9946eAe1021199B39C61",
        "0x332730a4F6E03D9C55829435f10360E13cfA41Ff",
      ]
    }),
  }
}
