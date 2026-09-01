// PROS on BSC
const RECEIPT_TOKEN = "0x460dDE85b3CA09e82156E37eFFf50cd07bc3F7f9"; // Staked (receipt) token
const ORIGINAL_TOKEN = "0x915424Ac489433130d92B04096F3b96c82e92a9D"; // PROS token

// ------------------------------
// Staking Function: Only returns staked PROS
// ------------------------------
async function staking(api) {
  const stakedBalance = await api.call({
    abi: "erc20:totalSupply",
    target: RECEIPT_TOKEN,
  });
  api.add(ORIGINAL_TOKEN, stakedBalance);
  return api.getBalances();
}

// ------------------------------
// Module Exports
// ------------------------------
module.exports = {
  misrepresentedTokens: true,
  //     1. PROS Baseline Hashrate Value: (500,080 TH/s of capacity * Hashrate Index's ASIC Price Index for 19 to 25 J/TH efficiency tier). Note that this is is a baseline or minimum value of Prosper's hashrate, as it only accounts for the base value of the ASIC miners, and does not include the value of all the infrastructure required to enable live, operational hashrate.
  methodology: `
    Total TVL:
    2. Staked Value of PROS: Total supply of the receipt token, representing staked PROS (provided only in the staking function).
    3. Treasury Value:
       a) BTC held in the treasury (BTC balance * current BTC price),
       b) PROS held in the treasury (PROS balance * current PROS price)
  `,
  bsc: {
    tvl: () => ({}),
    staking,
  },
};
