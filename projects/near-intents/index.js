const axios = require("axios");

// Constants
const FLIPSIDE_API_URL = "https://flipsidecrypto.xyz/api/v1/queries/912162c9-22f1-46d9-88a1-1059b8f0b6b3/data/latest";
const SUCCESS_CODES = [200, 201, 202, 203, 204, 205, 206, 207, 208, 226];

// Token mapping with Flipside addresses and verified Coingecko IDs
const TOKEN_MAPPING = {
    'USDT': {
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        coingeckoId: 'tether'
    },
    'USDC': {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        coingeckoId: 'usd-coin'
    },
    'ZEC': {
        address: 'native',
        coingeckoId: 'zcash'
    },
    'SOL': {
        address: 'native',
        coingeckoId: 'solana'
    },
    'ETH': {
        address: 'native',
        coingeckoId: 'ethereum'
    },
    'WNEAR': {
        address: 'wrap.near',
        coingeckoId: 'near'
    },
    'CBBTC': {
        address: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
        coingeckoId: 'wrapped-bitcoin'
    },
    'XRP': {
        address: 'native',
        coingeckoId: 'ripple'
    },
    'BTC': {
        address: 'native',
        coingeckoId: 'bitcoin'
    },
    'BERA': {
        address: 'native',
        coingeckoId: 'bera'
    },
    'TRX': {
        address: 'native',
        coingeckoId: 'tron'
    },
    'AURORA': {
        address: 'aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near',
        coingeckoId: 'aurora-near'
    },
    'ARB': {
        address: '0x912ce59144191c1204e64559fe8253a0e49e6548',
        coingeckoId: 'arbitrum'
    },
    'POL': {
        address: 'native',
        coingeckoId: 'polygon'
    },
    'REF': {
        address: 'token.v2.ref-finance.near',
        coingeckoId: 'ref-finance'
    },
    'BLACKDRAGON': {
        address: 'blackdragon.tkn.near',
        coingeckoId: 'black-dragon'
    },
    'SWEAT': {
        address: 'token.sweat',
        coingeckoId: 'sweatcoin'
    },
    'BNB': {
        address: 'native',
        coingeckoId: 'binancecoin'
    },
    'GNO': {
        address: '0x9c58bacc331c9aa871afd802db6379a98e80cedb',
        coingeckoId: 'gnosis'
    },
    'MPDAO': {
        address: 'mpdao-token.near',
        coingeckoId: 'meta-pool-dao'
    }
};

// Utility functions
async function httpGet(url) {
    try {
        const res = await axios.get(url);
        if (!SUCCESS_CODES.includes(res.status)) {
            throw new Error(`Error fetching ${url}: ${res.status} ${res.statusText}`);
        }
        if (!res.data) {
            throw new Error(`Error fetching ${url}: no data`);
        }
        return res.data;
    } catch (error) {
        throw new Error(`HTTP request to ${url} failed: ${error.message}`);
    }
}

async function tvl(api) {
    try {
        // Fetch TVL data from Flipside Crypto
        const assetsCallResponse = await httpGet(FLIPSIDE_API_URL);

        if (!Array.isArray(assetsCallResponse)) {
            throw new Error('Invalid API response format');
        }

        // Process each token balance
        for (const item of assetsCallResponse) {
            if (!item.SYMBOL || !item.NET_TOKENS_MINTED_USD) continue;
            
            const symbol = item.SYMBOL.toUpperCase();
            const tokenInfo = TOKEN_MAPPING[symbol];
            
            if (tokenInfo) {
                // Add balance with token info
                api.add(tokenInfo.coingeckoId, item.NET_TOKENS_MINTED_USD);
            }
        }
    } catch (error) {
        throw new Error(`Near Intents TVL calculation failed: ${error.message}`);
    }
}

module.exports = {
    near: {
        tvl
    },
    methodology: "TVL is calculated by tracking the net minted tokens in USD value through Flipside Crypto API, which aggregates data from the NEAR blockchain",
    timetravel: false,
    misrepresentedTokens: false,
    hallmarks: [
        [Math.floor(Date.now() / 1000), "Initial adapter release"]
    ]
};