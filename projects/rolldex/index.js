const abi = {
  totalValue: "function totalValue() view returns ((address tokenAddress, int256 value, uint8 decimals, int256 valueUsd, uint16 targetWeight,uint16 feeBasisPoints,uint16 taxBasisPoints, bool dynamicFee)[])",
};

const CONFIG = {
  btr: ['0x3d0E678776e4287BEfB0449d344D195ad1A2C418'],
  base: [
    '0xa67998d867cd4b64fe9ecc1549341f1d86389c0f',
    '0x823e0F1E91f9851529Ce90c23e144203a59eF40a',
  ],
};

const blacklistedTokens = {
  base: [
    '0x623F2774d9f27B59bc6b954544487532CE79d9DF', // almost all of it deposited by a single user
  ]
}

const tvl = async (api) => {
  var tokens = []
  for(var i = 0; i < CONFIG[api.chain].length; i++){
    const tokenInfo = await api.call({ abi: abi.totalValue, target: CONFIG[api.chain][i], });
    tokenInfo.forEach((item)=>{
        tokens.push(item.tokenAddress)
    })
  }
  
  return api.sumTokens({ tokens, owners: CONFIG[api.chain], blacklistedTokens: blacklistedTokens[api.chain]  });
}

module.exports.methodology = "RollX functions as a decentralized exchange for crypto derivatives. It offers on-chain perpetuals, providing traders and stakers with exceptional opportunities."

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = {
    tvl,
  };
})
