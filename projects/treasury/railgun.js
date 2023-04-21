const { tokens } = require("../helper/chain/algorand");
const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury
const ethTreasury = "0xE8A8B458BcD1Ececc6b6b58F80929b29cCecFF40";
const bscTreasury = "0xdca05161eE5b5FA6DF170191c88857E70FFB4094";
const polygonTreasury = "0xdca05161eE5b5FA6DF170191c88857E70FFB4094";
const arbitrumTreasury = "0x3B374464a714525498e445ba050B91571937bFc8"
//ownTokens
const ethRAIL = "0xe76c6c83af64e4c60245d8c7de953df673a7a33d";
const polygonRAIL = "0x92A9C92C215092720C731c96D4Ff508c831a714f";// not on coingecko


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        // Ethereum Assets
        nullAddress,
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",//weth
        "0x295B42684F90c77DA7ea46336001010F2791Ec8c",//xi
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",//usdc
        "0xdAC17F958D2ee523a2206206994597C13D831ec7",//usdt
        "0x6B175474E89094C44Da98b954EedeAC495271d0F",//dai
        "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",//fxs
        "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",//wsteth
        "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",//cvx
        "0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D",//renbtc
        "0x62B9c7356A2Dc64a1969e19C23e4f579F9810Aa7",//cvxcrv
        "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0",//wbtc
        "0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3",//mim
        "0x5f98805A4E8be255a32880FDeC7F6728C6568bA0",//lusd
        "0x090185f2135308BaD17527004364eBcC2D37e5F6",//spell
        "0x4Fabb145d64652a948d72533023f6E7A623C7C53",//busd
        "0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0",//albt
        "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",//snx
        "0x509A38b7a1cC0dcd83Aa9d06214663D9eC7c7F4a",//bst
        "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",//shib
        "0x514910771AF9Ca656af840dff83E8264EcF986CA",//link
        "0x21381e026Ad6d8266244f2A583b35F9E4413FA2a",//form
        "0x2e9d63788249371f1DFC918a52f8d799F4a38C94",//toke
        "0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E",//ilv
        "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",//mkr
        "0xc5fb36dd2fb59d3b98deff88425a3f425ee469ed",//tsuka
        "0x853d955acef822db058eb8505911ed77f175b99e",//frax
        "0x2223bF1D7c19EF7C06DAB88938EC7B85952cCd89",//kxa
        "0x0f2d719407fdbeff09d87557abb7232601fd9f29",//syn
        "0x7aE1D57b58fA6411F32948314BadD83583eE0e8C",//paper
        "0xf65B5C5104c4faFD4b709d9D60a185eAE063276c",//tru
        "0x3597bfd533a99c9aa083587b074434e61eb0a258",//dent
        "0xcc8fa225d80b9c7d42f96e9570156c65d6caaa25",//slp
        "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",//uni
        "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",//matic
        "0x9aE380F0272E2162340a5bB646c354271c0F5cFC",//cnc
        "0x07bac35846e5ed502aa91adf6a9e7aa210f2dcbe",//erowan
        "0xfb7b4564402e5500db5bb6d63ae671302777c75a",//dext
        "0x33349b282065b0284d756f0577fb39c158f935e6",//mpl
        "0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c",//bnt
        "0xBC19712FEB3a26080eBf6f2F7849b417FdD792CA",//boring
        "0x34F7Da1243A4Aaa69DE3639a2f124Fa56f4DD5cd",//tess
     ],
    owners: [ethTreasury],
    ownTokens: [ethRAIL]
  },
  bsc: {
    tokens: [ 
        // bsc Assets
        nullAddress,
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",//wbnb
        "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",//busd
        "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",//dai
        "0x55d398326f99059fF775485246999027B3197955",//bsc-usd
        "0x39cC67690D0F2d4aCD68d3d9B612a80D780b84c0",//agro
        "0xbF7c81FFF98BbE61B40Ed186e4AfD6DDd01337fe",//egld
        "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",//usdc
        "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",//cake
        "0xAdBAF88B39D37Dc68775eD1541F1bf83A5A45feB",//coti
        "0xBfACD29427fF376FF3BC22dfFB29866277cA5Fb4",//pstn
        "0x9A2f5556e9A637e8fBcE886d8e3cf8b316a1D8a2",//bidr
        "0xC9849E6fdB743d08fAeE3E34dd2D1bc69EA11a51",//bunny
     ],
    owners: [bscTreasury],
    ownTokens: []
  },
  polygon: {
    tokens: [ 
        // polygon Assets
        nullAddress,
        "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",//weth
        "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",//usdc
        "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",//usdt
        "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",//dai
        "0x1a3acf6D19267E2d3e7f898f42803e90C9219062",//fxs
        "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",//wsteth
        "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",//wbtc
        "0xE5417Af564e4bFDA1c483642db72007871397896",//gns
        "0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b",//avax
        "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",//link
        "0xfe712251173A2cd5F5bE2B46Bb528328EA3565E1",//mvi
        "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",//wmatic
        "0x752d59604d72b6DC44196f4A39A3f07779417407",//methmoon
        "0x8f006D1e1D9dC6C98996F50a4c810F17a47fBF19",//nsfw
        "0xDBf31dF14B66535aF65AaC99C32e9eA844e14501",//renbtc
        "0x9c891326Fd8b1a713974f73bb604677E1E63396D",//islami
        "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89",//frax
        "0xB0B195aEFA3650A6908f15CdaC7D92F8a5791B0B",//bob
        "0x580A84C73811E1839F75d86d75d88cCa0c241fF4",//qi
        "0x980111ae1B84E50222C8843e3A7a038F36Fecd2b",//stack
        "0xB5C064F955D8e7F38fE0460C556a72987494eE17",//quick
        "0x6C0AB120dBd11BA701AFF6748568311668F63FE0",//apw
        "0xE0339c80fFDE91F3e20494Df88d4206D86024cdF",//elon
     ],
    owners: [polygonTreasury],
    ownTokens: [polygonRAIL]
  },
  arbitrum: {
    tokens: [ 
        // arbitrum assets
        nullAddress,
        "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",//weth
        "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
        "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
        "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
     ],
    owners: [arbitrumTreasury],
    ownTokens: []
  },
})

