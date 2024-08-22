const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_RPC);

const TOKEN_CONTRACT_ADDRESS = "2zE5rJ2ctXMz9hVbk1AvJa78X7mh3kuR728SNzGXTEeu";
const SMART_CONTRACT_ADDRESS = "EhwfVLp7NFj4G19YkFUqeKHSFgv7DXskqzaRSTSD7vgq";

async function getTotalValueLocked() {
    try {
        const tokenAccount = new PublicKey(TOKEN_CONTRACT_ADDRESS);
        const tokenSupply = await connection.getTokenSupply(tokenAccount);
        const supplyAmount = tokenSupply.value.uiAmount;

        // Fetching the token price from an API like CoinGecko (Assuming it's listed)
        const { data } = await axios.get(`https://api.coingecko.com/api/v3/simple/token_price/solana?contract_addresses=${TOKEN_CONTRACT_ADDRESS}&vs_currencies=usd`);
        const tokenPrice = data[TOKEN_CONTRACT_ADDRESS]?.usd || 0;

        // Calculating TVL
        const tvl = supplyAmount * tokenPrice;
        return tvl;
    } catch (error) {
        console.error("Error fetching TVL:", error);
        return 0;
    }
}

module.exports = {
    timetravel: false,
    solana: {
        tvl: getTotalValueLocked,
    },
};
