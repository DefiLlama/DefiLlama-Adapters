const { getReserves, getSio2Tvl } = require("./sio2");
const BigNumber = require("bignumber.js");
const { getBorrowed } = require("../helper/aave");
const { TOKENS, DOT_TOKEN, DOT_DECIMALS, DEFAULT_DECIMALS } = require("./constants");

const transferFromAddress = (underlying) => TOKENS[underlying]

function astar(borrowed) {
  return async (timestamp, _, {star: block}) => {
    const balances = {};
    const [sTokens, reserveTokens, validProtocolDataHelpers] =
      await getReserves(block);

    const chain = "astar";

    if (borrowed) {
      await getBorrowed(
        balances,
        block,
        chain,
        reserveTokens,
        validProtocolDataHelpers,
        transferFromAddress
      );
    } else {
      await getSio2Tvl(
        balances,
        block,
        chain,
        sTokens,
        reserveTokens,
        transferFromAddress
      );
    }

    return Object.keys(balances).reduce((res, key) => {
      if (key.startsWith("0x"))
        return { ...res, [key]: balances[key] };
      if (key === DOT_TOKEN)
        return { ...res, [key]: new BigNumber(balances[key]).shiftedBy(-DOT_DECIMALS).toNumber() };
      return { ...res, [key]: new BigNumber(balances[key]).shiftedBy(-DEFAULT_DECIMALS).toNumber() };
    }, {});
  };
}



module.exports = {
  timetravel: true,
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.`,
  astar: {
    tvl: astar(false),
    borrowed: astar(true)
  }
}
