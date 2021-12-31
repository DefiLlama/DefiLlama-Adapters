const { getContract } = require("./addresses");

const AddressZero = "0x0000000000000000000000000000000000000000";

const TOKENS = {
    // AURORA MAINNET
    1313161554: [
        {
            name: "NEAR (wNEAR)",
            symbol: "NEAR",
            decimals: 24,
            address: getContract(1313161554, "NEAR"),
            coingeckoUrl: "https://www.coingecko.com/en/coins/near",
            imageUrl:
                "https://assets.coingecko.com/coins/images/10365/small/near_icon.png?1601359077",
        },
        {
            name: "Bitcoin (WBTC)",
            symbol: "BTC",
            decimals: 8,
            address: getContract(1313161554, "BTC"),
            coingeckoUrl: "https://www.coingecko.com/en/coins/wrapped-bitcoin",
            imageUrl:
                "https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579",
        },
        {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
            address: AddressZero,
        },
        {
            name: "Wrapped Ethereum",
            symbol: "WETH",
            decimals: 18,
            address: getContract(1313161554, "NATIVE_TOKEN"),
            isWrapped: true, // NOTE - Seems required even though shown in from token selector list
            coingeckoUrl: "https://www.coingecko.com/en/coins/ethereum",
            imageUrl:
                "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        },
        {
            name: "Necc Dollars",
            symbol: "NDOL",
            decimals: 18,
            address: getContract(1313161554, "NDOL"),
            isNdol: true,
            imageUrl: "https://assets.necc.io/ndol%20token%20300x300.png",
        },
        {
            name: "Necc",
            symbol: "Necc",
            decimals: 9,
            address: getContract(1313161554, "Necc"),
            imageUrl: "https://assets.necc.io/necc%20token%20300x300.png",
        },
        {
            name: "nNecc",
            symbol: "nNecc",
            decimals: 18,
            address: getContract(1313161554, "nNecc"),
            imageUrl: "https://assets.necc.io/nNecc%20token%20300x300.png",
        },
        {
            name: "sNecc",
            symbol: "sNecc",
            decimals: 9,
            address: getContract(1313161554, "sNecc"),
        },
        {
            name: "NDOL-nNecc LP",
            symbol: "NDOLnNeccLP",
            decimals: 18,
            address: getContract(1313161554, "NDOL_NNECC_PAIR"),
            isLP: true,
        },
    ],
    // RINKEBY
    4: [
        {
            name: "Bitcoin (WBTC)",
            symbol: "BTC",
            decimals: 8,
            address: getContract(4, "BTC"),
            coingeckoUrl: "https://www.coingecko.com/en/coins/wrapped-bitcoin",
            imageUrl:
                "https://assets.coingecko.com/coins/images/1/small/bitcoin.png?1547033579",
        },
        {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
            address: AddressZero,
        },
        {
            name: "Wrapped Ethereum",
            symbol: "WETH",
            decimals: 18,
            address: getContract(4, "NATIVE_TOKEN"),
            isWrapped: true, // NOTE - Seems required even though shown in from token selector list
            coingeckoUrl: "https://www.coingecko.com/en/coins/ethereum",
            imageUrl:
                "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        },
        {
            name: "Necc Dollars",
            symbol: "NDOL",
            decimals: 18,
            address: getContract(4, "NDOL"),
            isNdol: true,
        },
        {
            name: "Necc",
            symbol: "Necc",
            decimals: 9,
            address: getContract(4, "Necc"),
        },
        {
            name: "sNecc",
            symbol: "sNecc",
            decimals: 9,
            address: getContract(4, "sNecc"),
        },
        // {
        //   name: "NDOL-Necc LP",
        //   symbol: "NDOLnNeccLP",
        //   decimals: 18,
        //   address: getContract(4, "NDOL_NNECC_PAIR"),
        //   isLP: true,
        // },
    ],
    // Local
    1337: [
        {
            name: "NEAR (wNEAR)",
            symbol: "NEAR",
            decimals: 24,
            address: getContract(1337, "NEAR"),
        },
        {
            name: "Bitcoin (WBTC)",
            symbol: "BTC",
            decimals: 8,
            address: getContract(1337, "BTC"),
        },
        {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
            address: AddressZero,
        },
        {
            name: "Wrapped Ethereum",
            symbol: "WETH",
            decimals: 18,
            address: getContract(1337, "NATIVE_TOKEN"),
            isWrapped: true, // NOTE - Seems required even though shown in from token selector list
        },
        {
            name: "Necc Dollars",
            symbol: "NDOL",
            decimals: 18,
            address: getContract(1337, "NDOL"),
            isNdol: true,
        },
        {
            name: "Necc",
            symbol: "Necc",
            decimals: 9,
            address: getContract(1337, "Necc"),
        },
        {
            name: "sNecc",
            symbol: "sNecc",
            decimals: 9,
            address: getContract(1337, "sNecc"),
        },
        {
            name: "NDOL-nNecc LP",
            symbol: "NDOLnNeccLP",
            decimals: 18,
            address: getContract(1337, "NDOL_NNECC_PAIR"),
            isLP: true,
        },
    ],
};

const CHAIN_IDS = [1313161554, 4, 1337];

const TOKEN_SYMBOLS = ["NEAR", "WETH", "BTC"];

const TOKENS_MAP = {};

const TOKENS_BY_SYMBOL_MAP = {};

for (let j = 0; j < CHAIN_IDS.length; j++) {
    const chainId = CHAIN_IDS[j];
    TOKENS_MAP[chainId] = {};
    TOKENS_BY_SYMBOL_MAP[chainId] = {};
    for (let i = 0; i < TOKENS[chainId].length; i++) {
        const token = TOKENS[chainId][i];
        TOKENS_MAP[chainId][token.address] = token;
        TOKENS_BY_SYMBOL_MAP[chainId][token.symbol] = token;
    }
}

function getTokenBySymbol(chainId, symbol) {
    const token = TOKENS_BY_SYMBOL_MAP[chainId][symbol];
    if (!token) {
        throw new Error(`Incorrect symbol "${symbol}" for chainId ${chainId}`);
    }
    return token;
}

module.exports = {
    getTokenBySymbol,
    TOKEN_SYMBOLS,
    TOKENS
}
