const { aaveV2Export } = require('../helper/aave');
const methodologies = require('../helper/methodologies');
const { staking } = require('../helper/unknownTokens')

const stakingContract = "0x7d236c0486c9579507C67B36d175990CAb5100fC";
const stakedToken = "0xa4B59aA3De2af57959C23E2c9c89a2fCB408Ce6A";

const stakingContractPool2 = "0x80161779e4d5EcBC33918ca37f7F263DDc480017";
const stakedToken_WrappedCurrency_spLP = "0x93D4Be3C0B11fe52818cD96A5686Db1E21D749ce";
const lendingpool = "0x9aeba63d77d25c95dadd057db74741517862f360";

module.exports = {
  methodology: methodologies.lendingMarket,
    conflux: {
      ...aaveV2Export(lendingpool),
    staking: staking({ owner: stakingContract, tokens: [stakedToken], lps: [stakedToken_WrappedCurrency_spLP], useDefaultCoreAssets: true,  }),
    pool2: staking({ owner: stakingContractPool2, tokens: [stakedToken_WrappedCurrency_spLP], lps: [stakedToken_WrappedCurrency_spLP], useDefaultCoreAssets: true,  }),
  },
  hallmarks:[
    [1671415334, "Goledo Creation timestamp"]
  ],
};
module.exports.conflux.borrowed = ()  => ({})
module.exports.deadFrom = '2025-05-01' 
