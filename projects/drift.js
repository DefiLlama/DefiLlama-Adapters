const { getTokenAccountBalance } = require("./helper/solana");

async function tvl() {
  const usdcLocked = await getTokenAccountBalance(
    "6W9yiHDCW9EpropkFV8R3rPiL8LVWUHSiys3YeW6AT6S"
  );
  return {
    "usd-coin": usdcLocked,
  };
}

module.exports = {
  methodology:
    "Calculate the USDC on 6W9yiHDCW9EpropkFV8R3rPiL8LVWUHSiys3YeW6AT6S through on-chain calls",
  solana: {
    tvl,
  },
};
