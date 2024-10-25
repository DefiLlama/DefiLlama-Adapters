
const anchor = require("@coral-xyz/anchor");
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
const resp = {
  "code": 0,
  "data": [
    {
      "id": 17,
      "pair_id": "So11111111111111111111111111111111111111112:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "SOL/USDC",
      "base_token": {
        "id": 19,
        "code": "So11111111111111111111111111111111111111112",
        "symbol": "SOL",
        "name": "Wrapped SOL",
        "icon": "",
        "decimals": 9,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": true,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 26,
      "pair_id": "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "WBTC/USDC",
      "base_token": {
        "id": 21,
        "code": "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
        "symbol": "WBTC",
        "name": "Wrapped BTC (Wormhole)",
        "icon": "",
        "decimals": 8,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": false,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 27,
      "pair_id": "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "WETH/USDC",
      "base_token": {
        "id": 22,
        "code": "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
        "symbol": "WETH",
        "name": "Wrapped Ether (Wormhole)",
        "icon": "",
        "decimals": 8,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": false,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 28,
      "pair_id": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "JUP/USDC",
      "base_token": {
        "id": 23,
        "code": "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
        "symbol": "JUP",
        "name": "Jupiter",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": false,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 29,
      "pair_id": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "Bonk/USDC",
      "base_token": {
        "id": 24,
        "code": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        "symbol": "Bonk",
        "name": "Bonk",
        "icon": "",
        "decimals": 5,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": false,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 30,
      "pair_id": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "RAY/USDC",
      "base_token": {
        "id": 25,
        "code": "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        "symbol": "RAY",
        "name": "Raydium",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": false,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 31,
      "pair_id": "45EgCwcPXYagBC7KqBin4nCFgEZWN7f3Y6nACwxqMCWX:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "Moutai/USDC",
      "base_token": {
        "id": 26,
        "code": "45EgCwcPXYagBC7KqBin4nCFgEZWN7f3Y6nACwxqMCWX",
        "symbol": "Moutai",
        "name": "Moutai",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": true,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 32,
      "pair_id": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "$WIF/USDC",
      "base_token": {
        "id": 27,
        "code": "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
        "symbol": "$WIF",
        "name": "dogwifhat",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": false,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 33,
      "pair_id": "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "KMNO/USDC",
      "base_token": {
        "id": 28,
        "code": "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS",
        "symbol": "KMNO",
        "name": "Kamino",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": false,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 34,
      "pair_id": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "mSOL/USDC",
      "base_token": {
        "id": 29,
        "code": "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        "symbol": "mSOL",
        "name": "Marinade staked SOL (mSOL)",
        "icon": "",
        "decimals": 9,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": false,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 35,
      "pair_id": "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "ORCA/USDC",
      "base_token": {
        "id": 30,
        "code": "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE",
        "symbol": "ORCA",
        "name": "Orca",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": false,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 36,
      "pair_id": "7p6RjGNZ7HLHpfTo6nh21XYw4CZgxXLQPzKXG72pNd2y:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "CIGGS/USDC",
      "base_token": {
        "id": 31,
        "code": "7p6RjGNZ7HLHpfTo6nh21XYw4CZgxXLQPzKXG72pNd2y",
        "symbol": "CIGGS",
        "name": "CHUNGHWA",
        "icon": "",
        "decimals": 9,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": true,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    },
    {
      "id": 37,
      "pair_id": "3dCCbYca3jSgRdDiMEeV5e3YKNzsZAp3ZVfzUsbb4be4:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      "name": "BUTT/USDC",
      "base_token": {
        "id": 32,
        "code": "3dCCbYca3jSgRdDiMEeV5e3YKNzsZAp3ZVfzUsbb4be4",
        "symbol": "BUTT",
        "name": "Buttercat",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "quote_token": {
        "id": 20,
        "code": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        "symbol": "USDC",
        "name": "USD Coin",
        "icon": "",
        "decimals": 6,
        "oracle_id": ""
      },
      "is_main": false,
      "is_meme": false,
      "is_mining": true,
      "support_dca": false,
      "support_grid": true,
      "market_cap_volume": "0"
    }
  ]
}

async function getPairs() {
  return resp.data
  // try {
  //   const pairResponse = await axios.get('https://solapi.deltatrade.ai/api/bot/grid/pairs', {
  //     maxRedirects: 0  
  //   });
  //   return pairResponse.data.data;
  // } catch (error) {
  //   if (error.response && error.response.status >= 300 && error.response.status < 400) {
  //     const redirectUrl = error.response.headers.location;
  //     console.log(`Redirecting to: ${redirectUrl}`);
  //     const redirectedResponse = await axios.get(redirectUrl);
  //     return redirectedResponse.data.data;
  //   } else {
  //     console.error('Error fetching pairs:', error.message);
  //     throw error;
  //   }
  // }
}

async function getGlobalBalanceUser(tokenInfo) {
  const [globalBalPda] = anchor.web3.PublicKey.findProgramAddressSync(
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
