const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

module.exports = {
   methodology: "Total Value Locked comprises of the sum of net liquidity at each pair of the Value Added eXchange (VAX), calculated using DefiLlamas native 'calculateusdUniTvl' module from SDK.",
   multivac: {
       tvl: calculateUsdUniTvl(
           "0xbaC576111e2BC5EfBbE7c5d765b9DC44083901fD",
           "multivac",
           "0x8E321596267a4727746b2F48BC8736DB5Da26977",
           [
               "0xEa1199d50Ee09fA8062fd9dA3D55C6F90C1bABd2",
               "0x86FF8138dcA8904089D3d003d16a5a2d710D36D2",
               "0x2Eb19Db032dC60039d35E36918d33197D9F7D7b9",
               "0xFC0c8D38166fc417F19De5B44CfC339079a70913",
               "0xCd65eb7630e5A2C46E1b99c0F3a45611be4960B2",
               "0x3b6e35574Fe60D7CeB9CA70DcA56D7294EF28926",
               "0x67558D91654A6ccbe88a3cc4e1DB862BC51fc322",
               "0x25009A734EfFE43cf7609Bc313E987d7ee8ee346",
               "0x282A0c6a96747bfF4BAa80eBa6CE6744aafaBEbB",
               "0x185B1FF9878D27DdE302A511FC2f80765232ADB7",
               "0x175E9B026cf31fbE181628C9BDAb3DF6143b6F18"
           ],
           "multivac"
       ),
   }
};
