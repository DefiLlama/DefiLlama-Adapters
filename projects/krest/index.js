import { ApiPromise, WsProvider } from '@polkadot/api';

// const MINT_TOKEN_CONTRACT = '0x1f3Af095CDa17d63cad238358837321e95FC5915';
// const MINT_CLUB_BOND_CONTRACT = '0x8BBac0C7583Cc146244a18863E708bFFbbF19975';

// Set up the provider to connect to the parachain
const provider = new WsProvider('wss://wsspc1-qa.agung.peaq.network');
// Create the API instance with the provider  
const api = new ApiPromise({ provider });
// Wait until the API is ready
await api.isReady;

async function tvl(_, _1, _2, { api }) {
    // Make an RPC call to get the latest block hash
    // const blockHash = await api.rpc.chain.getBlockHash();

    // Listen to chain state changes
    // api.query.system.account('5FZpsT8LKCX7tMKNX7e24R1BgnMfzgSL1Y4V9enYFoYpSmft', ({ data: balance }) => {
    //   console.log(`New balance is ${balance.free}`);
    // });

    const collateralBalance = await api.call({
        abi: 'erc20:balanceOf',
        target: MINT_TOKEN_CONTRACT,
        params: [MINT_CLUB_BOND_CONTRACT],
    });

    // Calculate TVL: Total value locked (stakes, other locked tokens, liquidity-pools etc.)
    api.add(MINT_TOKEN_CONTRACT, collateralBalance)
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
    start: 1000235,
    bsc: {
        tvl,
    }
}; 
