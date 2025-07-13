require("dotenv").config()
const { sumTokens2 } = require('../helper/unwrapLPs');
const { JsonRpcProvider, Contract } = require("ethers");
const { getAssociatedTokenAddress, getTokenAccountBalances } = require('../helper/solana');
const {PublicKey, Connection} = require('@solana/web3.js')


const AVAX_PROVIDER = new JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc");
const AVAX_FACTORY = "0x501ee2D4AA611C906F785e10cC868e145183FCE4";

const avaxFactoryAbi = [
  "function getMarketsLength() view returns (uint256)",
  "function getMarketAt(uint256) view returns (address)",
];

const avaxMarketAbi = [
  "function getBaseToken() view returns (address)",
  "function getQuoteToken() view returns (address)",
];


async function tvlAvax(_, _b, { api }) {
  const factory = new Contract(AVAX_FACTORY, avaxFactoryAbi, AVAX_PROVIDER);

  let marketCount;
  try {
    marketCount = Number(await factory.getMarketsLength());
  } catch (e) {
    throw new Error("Failed to fetch market count from Avalanche factory: " + e.message);
  }

  const tokensAndOwners = [];

  for (let i = 0; i < marketCount; i++) {
    const marketAddress = await factory.getMarketAt(i);
    const market = new Contract(marketAddress, avaxMarketAbi, AVAX_PROVIDER);

    try {
      const [baseToken, quoteToken] = await Promise.all([
        market.getBaseToken(),
        market.getQuoteToken(),
      ]);

      tokensAndOwners.push([baseToken, marketAddress]);
      tokensAndOwners.push([quoteToken, marketAddress]);
    } catch (e) {
      console.warn(`Failed to process Avalanche market ${i}: ${marketAddress}`);
    }
  }
  return sumTokens2({ api, tokensAndOwners, chain:'avax', allowFailure:true });
}

//SOLANA 

const SOLANA_FACTORY = "JoeaRXgtME3jAoz5WuFXGEndfv4NPH9nBxsLq44hk9J";

async function tvlSolana(_, _b, { api }) {
  const connection = new Connection(process.env.HELIUS_RPC);
  const programId = new PublicKey(SOLANA_FACTORY);

  const accounts = await connection.getProgramAccounts(programId);
  const tokenAccounts = [];

  for (const account of accounts) {
    const pubkey = account.pubkey.toBase58();

    const data = Buffer.from(account.account.data);

    if (data.length < 128) continue;

    const baseMint = new PublicKey(data.subarray(64, 96)).toString();
    const quoteMint = new PublicKey(data.subarray(96, 128)).toString();

    const ataBase = getAssociatedTokenAddress(baseMint, pubkey);
    const ataQuote = getAssociatedTokenAddress(quoteMint, pubkey);

    tokenAccounts.push(ataBase);
    tokenAccounts.push(ataQuote);
  }

  const balances = await getTokenAccountBalances(tokenAccounts, {
    chain: "solana",
    allowError: true,
  });

  for (const [token, amount] of Object.entries(balances)) {
    api.add(token, amount);
  }

  return api.getBalances();
}

module.exports = {
  methodology: "TVL is calculated by summing the balances of base and quote tokens held in all Token Mill markets deployed via the factory contracts on each chain (Avalanche and Solana).",
  avax: {
    tvl: tvlAvax,
  },
  solana: {
    tvl: tvlSolana,
  },
};
