const { getMultipleAccountBuffers } = require("../helper/solana");

const MSOL_LP_SOL = "UefNb6z6yvArqe4cJHTXCqStRsKmWhGxnZzuHbikP5Q";
const MSOL_LP_MSOL = "7GgPYjS5Dza89wV6FpZ23kUJRG5vbQ1GM25ezspYFSoE";
const MSOL_LP_MINT = "LPmSozJJ8Jh69ut2WP3XmVohTjL4ipR18yiCzxrUmVj";

const getMSolLPTokens = (lpAmount) => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const accountData = await getMultipleAccountBuffers({
    msolTokens: MSOL_LP_MSOL,
    poolMint: MSOL_LP_MINT,
  });

  const solAmount =
    (await connection.getAccountInfo(MSOL_LP_SOL)).lamports / 10 ** 9;
  const msolAmount =
    Number(accountData.msolTokens.readBigUInt64LE(64)) / 10 ** 9;
  const lpSupply =
    Number(accountData.poolMint.readBigUInt64LE(4 + 32)) / 10 ** 9;

  return {
    msol: (msolAmount * lpAmount) / lpSupply,
    solana: (solAmount * lpAmount) / lpSupply,
  };
};

module.exports = {
  MSOL_LP_MINT,
  getMSolLPTokens,
};
