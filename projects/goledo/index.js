const { aaveV2Export } = require('../helper/aave');
const { staking } = require('../helper/unknownTokens')

const stakingContract = "0x7d236c0486c9579507C67B36d175990CAb5100fC";
const stakedToken = "0xa4B59aA3De2af57959C23E2c9c89a2fCB408Ce6A";

const stakingContractPool2 = "0x80161779e4d5EcBC33918ca37f7F263DDc480017";
const stakedToken_WrappedCurrency_spLP = "0x93D4Be3C0B11fe52818cD96A5686Db1E21D749ce";
const lendingpool = "0x9aeba63d77d25c95dadd057db74741517862f360";

module.exports = {
  methodology:
    `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko. To view the Borrowed amounts along with the currently liquidity, click the 'Borrowed' check box`,
    conflux: {
      ...aaveV2Export(lendingpool),
    staking: staking({ owner: stakingContract, tokens: [stakedToken], lps: [stakedToken_WrappedCurrency_spLP], useDefaultCoreAssets: true,  }),
    pool2: staking({ owner: stakingContractPool2, tokens: [stakedToken_WrappedCurrency_spLP], lps: [stakedToken_WrappedCurrency_spLP], useDefaultCoreAssets: true,  }),
  },
  hallmarks:[
    [1671415334, "Goledo Creation timestamp"]
  ],
};
