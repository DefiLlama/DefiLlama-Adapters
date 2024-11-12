const { PublicKey } = require("@solana/web3.js");
const { TOKEN_2022_PROGRAM_ID, getMint, amountToUiAmount } = require("@solana/spl-token");
const { getConnection } = require("../helper/solana"); 

const OPB_MINT_ADDRESS = new PublicKey("opbrKSFxFXRHNg75xjpEAbJ5R6e6GYZ6QKEqdvcBq7c");

async function tvl() {
  const connection = getConnection();

  // Placeholder for a signing-account which need to be setup by DeFiLlama team
  const payer = null; // Replace `null` with the account configured by DeFiLlama to allow access for `amountToUiAmount`, ref. line 19

  // Fetch OPB token mint information
  const mintInfo = await getMint(connection, OPB_MINT_ADDRESS, undefined, TOKEN_2022_PROGRAM_ID);
  const supply = Number(mintInfo.supply);
  const decimals = mintInfo.decimals;

  // Retrieve the UI amount for 1 OPB in USD terms
  const uiAmount = await amountToUiAmount(
    connection,
    payer,
    OPB_MINT_ADDRESS,
    1_000_000_000n,
    TOKEN_2022_PROGRAM_ID
  );
  const OPBPrice = Number(uiAmount);

  // Calculate TVL in USD
  const tvl = (supply * OPBPrice) / Math.pow(10, decimals);

  // Return TVL as USD
  return {
    usd: tvl,
  };
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by multiplying OPB token supply by the current USD value of 1.0 OPB. Initially worth $1.0, 1.0 OPB now reflects its increased value from accrued interest, derived via amountToUiAmount using the Interest Bearing extension.",
  solana: {
    tvl,
  },
};
