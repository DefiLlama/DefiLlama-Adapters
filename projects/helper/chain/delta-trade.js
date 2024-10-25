
// const anchor = require("@project-serum/anchor");
const axios = require("axios");
const sdk = require('@defillama/sdk');
const { PublicKey } = require('@solana/web3.js');
const { Token } = require("@solana/spl-token");
const { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const solanaRpcUrl = "https://solana-mainnet.core.chainstack.com/e814e86f51bba369ccf5318ae77146a5";
const state = new PublicKey('FRcbUFpGHQppvXAyJrNYLKME1BQfowh4xKZB2vt9j6yn');
const programId = new PublicKey('CNLGhYQgNwjyDfHZTEjHfk1MPkqwP96qZahWN82UfcLM');

const getTokenInfo = async () => {
  const info = await axios.get("https://solapi.deltatrade.ai/api/prices");
  return info?.data?.data;
};


async function getPairs() {
  try {
    const pairResponse = await axios.get('https://solapi.deltatrade.ai/api/bot/grid/pairs', {
      maxRedirects: 0  
    });
    return pairResponse.data.data;
  } catch (error) {
    if (error.response && error.response.status >= 300 && error.response.status < 400) {
      const redirectUrl = error.response.headers.location;
      console.log(`Redirecting to: ${redirectUrl}`);
      const redirectedResponse = await axios.get(redirectUrl);
      return redirectedResponse.data.data;
    } else {
      console.error('Error fetching pairs:', error.message);
      throw error;
    }
  }
}

async function getGlobalBalanceUser(tokenInfo) {
  const [globalBalPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("global_balance_user"), state.toBuffer(), new PublicKey(tokenInfo).toBuffer()],
    programId
  );

  const globalBalTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    new PublicKey(tokenInfo),
    new PublicKey(globalBalPda.toString()),
    true
  );

  return globalBalTokenAccount.toString();
}

async function callSolana(method, params) {
  try {
    const result = await axios.post(solanaRpcUrl, {
      jsonrpc: "2.0",
      id: "1",
      method,
      params
    });
    return result.data.result;
  } catch (error) {
    console.error(`Error calling Solana RPC method ${method}:`, error.message);
    return null;
  }
}

async function getTokenAccountBalance(tokenAddress) {
  const response = await callSolana("getTokenAccountBalance", [tokenAddress, { commitment: "confirmed" }]);
  return response?.value?.amount || 0;
}

async function getTokenBalanceForPair(baseToken, quoteToken) {
  const baseTokenBalance = await getTokenAccountBalance(baseToken);
  const quoteTokenBalance = await getTokenAccountBalance(quoteToken);
  return { baseTokenBalance, quoteTokenBalance };
}

async function calculateTVL() {
  let balances = {};
  let quoteTokenTotalBalance = 0;
  let stableToken = ''
  const pairs = await getPairs();
  // const priceList = await getTokenInfo();

  for (const pair of pairs) {
    const baseToken = await getGlobalBalanceUser(pair.base_token.code);
    const quoteToken = await getGlobalBalanceUser(pair.quote_token.code);
    stableToken = pair.quote_token.code;
    const { baseTokenBalance, quoteTokenBalance } = await getTokenBalanceForPair(baseToken, quoteToken);
    // const baseTokenTVL = (baseTokenBalance / Math.pow(10, pair.base_token.decimals)) * (priceList[pair.base_token.code] || 0);
    // const quoteTokenTVL = (quoteTokenBalance / Math.pow(10, pair.quote_token.decimals)) * (priceList[pair.quote_token.code] || 0);
    sdk.util.sumSingleBalance(balances, pair.base_token.code, baseTokenBalance, 'solana');
    if (!balances[`solana:${stableToken}`]) {
      quoteTokenTotalBalance = quoteTokenBalance;
    }
  }
  sdk.util.sumSingleBalance(balances, stableToken, quoteTokenTotalBalance,'solana');
  return balances;
}

module.exports = {
  calculateTVL
};
