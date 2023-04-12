const sdk = require('@defillama/sdk');
const { multiCall } = require('../helper/chain/starknet')
const { assetTokenAbi } = require('./abi');

const ASSET_TOKENS = [
    {
        asset: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", // WBTC
        tokens: [
            "0x0061d892cccf43daf73407194da9f0ea6dbece950bb24c50be2356444313a707",
            "0x00687b5d9e591844169bc6ad7d7256c4867a10cee6599625b9d78ea17a7caef9",
            "0x07788bc687f203b6451f2a82e842b27f39c7cae697dace12edfb86c9b1c12f3d",
            "0x06b59e2a746e141f90ec8b6e88e695265567ab3bdcf27059b4a15c89b0b7bd53",
        ]
    },
    {
        asset: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", // ETH
        tokens: [
            "0x002f8deaebb9da2cb53771b9e2c6d67265d11a4e745ebd74a726b8859c9337b9",
            "0x070f8a4fcd75190661ca09a7300b7c93fab93971b67ea712c664d7948a8a54c6",
            "0x04f89253e37ca0ab7190b2e9565808f105585c9cacca6b2fa6145553fa061a41",
            "0x0553cea5d1dc0e0157ffcd36a51a0ced717efdadd5ef1b4644352bb45bd35453",
        ]
    },
    {
        asset: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
        tokens: [
            "0x06af9a313434c0987f5952277f1ac8c61dc4d50b8b009539891ed8aaee5d041d",
            "0x029959a546dda754dc823a7b8aa65862c5825faeaaf7938741d8ca6bfdc69e4e",
            "0x05327df4c669cb9be5c1e2cf79e121edef43c1416fac884559cd94fcb7e6e232",
            "0x047e794d7c49c49fd2104a724cfa69a92c5a4b50a5753163802617394e973833",
        ]
    },
    {
        asset: "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
        tokens: [
            "0x00b9b1a4373de5b1458e598df53195ea3204aa926f46198b50b32ed843ce508b",
            "0x01ac55cabf2b79cf39b17ba0b43540a64205781c4b7850e881014aea6f89be58",
            "0x02ea39ba7a05f0c936b7468d8bc8d0e1f2116916064e7e163e7c1044d95bd135",
            "0x04403e420521e7a4ca0dc5192af81ca0bb36de343564a9495e11c8d9ba6e9d17",
        ]
    },
    {
        asset: "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
        tokens: [
            "0x06404c8e886fea27590710bb0e0e8c7a3e7d74afccc60663beb82707495f8609",
            "0x055ba2baf189b98c59f6951a584a3a7d7d6ff2c4ef88639794e739557e1876f0",
            "0x040375d0720245bc0d123aa35dc1c93d14a78f64456eff75f63757d99a0e6a83",
            "0x003cd2066f3c8b4677741b39db13acebba843bbbaa73d657412102ab4fd98601"
        ]
    },
]


async function tvl() {
  const balances = {};
  console.log(assetTokenAbi.totalSupply)
  const data = await multiCall({
    calls: ASSET_TOKENS.reduce((acc, obj) => acc.concat(obj.tokens), []),
    abi: assetTokenAbi.totalSupply
  });
  console.log(data);


  for (let i = 0; i < data.length; i++) {
    sdk.util.sumSingleBalance(balances, ASSET_TOKENS[parseInt(i/4)].asset, data[i])
  }
  
  console.log(balances)

  return balances;
}

module.exports = {
  methodology: 'Sums the circulating supply of each Nostra Asset Token.',
  starknet: {
    tvl,
  }
};
