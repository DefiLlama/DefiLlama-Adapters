const { stakingPricedLP } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { aaveChainTvl } = require("../helper/aave");

const stakingContract = "0x7d236c0486c9579507C67B36d175990CAb5100fC";
const stakedToken = "0xa4B59aA3De2af57959C23E2c9c89a2fCB408Ce6A";

const stakingContractPool2 = "0x80161779e4d5EcBC33918ca37f7F263DDc480017";
const stakedToken_WrappedCurrency_spLP = "0x93D4Be3C0B11fe52818cD96A5686Db1E21D749ce";

function lending(borrowed) {
  return aaveChainTvl(
    "conflux",
    "0xC2Fe74152b2c1dB056c8b34B87F3CF83042Cf2b9",
    undefined,
    ["0xfa444D1D52c0eeD101a838aCf09922b403E98671"],
    borrowed
  )
}

module.exports = {
  methodology:
    `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  conflux: {
    tvl: lending(false),
    borrowed: lending(true),
    staking: stakingPricedLP(stakingContract, stakedToken, "conflux", stakedToken_WrappedCurrency_spLP, "wrapped-conflux", false),
    pool2: pool2(stakingContractPool2, stakedToken_WrappedCurrency_spLP, "conflux"),
  },
  hallmarks: [
    [1671415334, "Goledo Creation timestamp"]
  ],
};
