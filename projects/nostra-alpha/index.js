const { multiCall } = require("../helper/chain/starknet");
const { assetTokenAbi } = require("./abi");

const supplyTokens = [
  // WBTC
  "0x0061d892cccf43daf73407194da9f0ea6dbece950bb24c50be2356444313a707",
  "0x00687b5d9e591844169bc6ad7d7256c4867a10cee6599625b9d78ea17a7caef9",
  "0x07788bc687f203b6451f2a82e842b27f39c7cae697dace12edfb86c9b1c12f3d",
  "0x06b59e2a746e141f90ec8b6e88e695265567ab3bdcf27059b4a15c89b0b7bd53",
  // ETH
  "0x002f8deaebb9da2cb53771b9e2c6d67265d11a4e745ebd74a726b8859c9337b9",
  "0x070f8a4fcd75190661ca09a7300b7c93fab93971b67ea712c664d7948a8a54c6",
  "0x04f89253e37ca0ab7190b2e9565808f105585c9cacca6b2fa6145553fa061a41",
  "0x0553cea5d1dc0e0157ffcd36a51a0ced717efdadd5ef1b4644352bb45bd35453",
  // USDC
  "0x06af9a313434c0987f5952277f1ac8c61dc4d50b8b009539891ed8aaee5d041d",
  "0x029959a546dda754dc823a7b8aa65862c5825faeaaf7938741d8ca6bfdc69e4e",
  "0x05327df4c669cb9be5c1e2cf79e121edef43c1416fac884559cd94fcb7e6e232",
  "0x047e794d7c49c49fd2104a724cfa69a92c5a4b50a5753163802617394e973833",
  // DAI
  "0x00b9b1a4373de5b1458e598df53195ea3204aa926f46198b50b32ed843ce508b",
  "0x01ac55cabf2b79cf39b17ba0b43540a64205781c4b7850e881014aea6f89be58",
  "0x02ea39ba7a05f0c936b7468d8bc8d0e1f2116916064e7e163e7c1044d95bd135",
  "0x04403e420521e7a4ca0dc5192af81ca0bb36de343564a9495e11c8d9ba6e9d17",
  // USDT
  "0x06404c8e886fea27590710bb0e0e8c7a3e7d74afccc60663beb82707495f8609",
  "0x055ba2baf189b98c59f6951a584a3a7d7d6ff2c4ef88639794e739557e1876f0",
  "0x040375d0720245bc0d123aa35dc1c93d14a78f64456eff75f63757d99a0e6a83",
  "0x003cd2066f3c8b4677741b39db13acebba843bbbaa73d657412102ab4fd98601",
];
const debtTokens = [
  "0x075b0d87aca8dee25df35cdc39a82b406168fa23a76fc3f03abbfdc6620bb6d7",
  "0x040b091cb020d91f4a4b34396946b4d4e2a450dbd9410432ebdbfe10e55ee5e5",
  "0x03b6058a9f6029b519bc72b2cc31bcb93ca704d0ab79fec2ae5d43f79ac07f7a",
  "0x0362b4455f5f4cc108a5a1ab1fd2cc6c4f0c70597abb541a99cf2734435ec9cb",
  "0x065c6c7119b738247583286021ea05acc6417aa86d391dcdda21843c1fc6e9c6",
];

function* chunks(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

async function tvl(api) {
  const supplied = await multiCall({
    calls: supplyTokens,
    abi: assetTokenAbi.totalSupply,
  });
  const borrowed = await multiCall({
    calls: debtTokens,
    abi: assetTokenAbi.totalSupply,
  });
  const underlyings = await multiCall({
    calls: debtTokens,
    abi: assetTokenAbi.underlyingAsset,
  });
  const data = [...chunks(supplied, 4)].map((chunk, i) => {
    const totalSupply = chunk.reduce((acc, cur) => acc + cur, 0);
    return totalSupply - borrowed[i];
  });
  api.addTokens(underlyings, data);
}

async function borrowed(api) {
  const borrowed = await multiCall({
    calls: debtTokens,
    abi: assetTokenAbi.totalSupply,
  });
  const underlyings = await multiCall({
    calls: debtTokens,
    abi: assetTokenAbi.underlyingAsset,
  });
  api.addTokens(underlyings, borrowed);
}

module.exports = {
  methodology:
    "The TVL is calculated as a difference between supplied and borrowed assets.",
  starknet: {
    tvl,
    borrowed,
  },
};
