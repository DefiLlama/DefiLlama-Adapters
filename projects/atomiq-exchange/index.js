const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens } = require("../helper/sumTokens");
const { sumTokens2 } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

const ATOMIQ_PROGRAM_ID = "atq2FYuvww5EF6qeB28gj9tkao6Ld9mEGUzF4M93cCC";

const config = {
    btnx: {
        vaults: ["0xe510D5781C6C849284Fb25Dc20b1684cEC445C8B", "0x9a027B5Bf43382Cc4A5134d9EFD389f61ece27B9"],
    },
    starknet: {
        vaults: ["0x01932042992647771f3d0aa6ee526e65359c891fe05a285faaf4d3ffa373e132", "0x04f278e1f19e495c3b1dd35ef307c4f7510768ed95481958fbae588bd173f79a"],
        tokens: [ADDRESSES.starknet.WBTC, ADDRESSES.starknet.STRK, ADDRESSES.starknet.ETH, ADDRESSES.starknet.STRKBTC]
    },
    citrea: {
        vaults: ["0x5bb0C725939cB825d1322A99a3FeB570097628c3", "0xc98Ef084d3911C8447DBbE4dDa18bC2c9bB0584e"],
    },
    solana: {
        tokens: [ADDRESSES.solana.SOL, ADDRESSES.solana.USDC, ADDRESSES.solana.USDT]
    }
}

async function tvl(api) {
    return await sumTokens({ api, owners: config[api.chain].vaults, tokens: config[api.chain].tokens ?? [ADDRESSES.null] });
}

async function tvlSolana(api) {
    // map to token accounts for all the relevant Solana tokens
    const tokenAccounts = config.solana.tokens.map(token => {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), new PublicKey(token).toBuffer()],
            new PublicKey(ATOMIQ_PROGRAM_ID)
        )[0].toString();
    });
    return sumTokens2({ api, tokenAccounts });
}

module.exports = {
    timetravel: false,
    btnx: { tvl },
    citrea: { tvl },
    starknet: { tvl },
    solana: { tvl: tvlSolana },
    methodology: `TVL counts the total assets held in the Atomiq Exchange spv vaults and escrow managers on each chain (excluding Bitcoin and Lightning).`
}
