const SPLToken = require("@solana/spl-token");

const convertLamportsToTokenAmount = (
  lamports,
  decimals
) => {
  return lamports / 10 ** decimals;
};

const accountInfoToLamports = (data) => {
  const decodedData = SPLToken.AccountLayout.decode(data.data);
  return Number(decodedData.amount);
};

const accountInfoToAmount = (
  data,
  tokenDecimals,
) => {
  if (!data.data.length) return 0;

  const lamports = accountInfoToLamports(data);
  return convertLamportsToTokenAmount(lamports, tokenDecimals);
};

module.exports = {
  accountInfoToAmount,
  accountInfoToLamports,
  convertLamportsToTokenAmount
}