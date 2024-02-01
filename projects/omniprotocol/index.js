const abi = require("./omni.json");
const { aaveExports } = require("../helper/aave");

const validProtocolDataHelper = "0x8AAc97e25c79195aC77817287Cf512b0Acc9da44";
const omniOracle = "0x08Eaf1C8c270a485DD9c8aebb2EDE3FcAe72e04f";

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. NFT's are counted as their floor price for both collateral and debt. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  ethereum: aaveExports('ethereum', undefined, undefined, [validProtocolDataHelper],  { oracle: omniOracle, 
  abis: {
    getAllATokens: abi.getAllOTokens,
  }}),
  hallmarks: [
    [Math.floor(new Date('2022-07-10')/1e3), 'reentrancy hack'],
  ],
};