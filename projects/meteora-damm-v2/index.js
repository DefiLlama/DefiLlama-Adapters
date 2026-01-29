const { sumTokens2, getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js');
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes');

// DAMM v2 Program ID
const DAMM_PROGRAM_ID = new PublicKey('cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG')

// Pool account discriminator (first 8 bytes of sha256("account:Pool"))
const POOL_DISCRIMINATOR = Buffer.from([241, 154, 109, 4, 17, 177, 109, 188])
const POOL_ACCOUNT_SIZE = 1112; // Size of Pool account in bytes

async function tvl() {
    const connection = getConnection()

    // Pool layout:
    // - discriminator: 8 bytes
    // - pool_fees (PoolFeesStruct): 160 bytes
    //   - base_fee (BaseFeeStruct): 40 bytes (32 + 8)
    //   - protocol_fee_percent: 1 byte
    //   - partner_fee_percent: 1 byte
    //   - referral_fee_percent: 1 byte
    //   - padding_0: 5 bytes
    //   - dynamic_fee (DynamicFeeStruct): 96 bytes
    //   - init_sqrt_price: 16 bytes
    // - token_a_mint: 32 bytes
    // - token_b_mint: 32 bytes
    // - token_a_vault: 32 bytes (starts at offset 232)
    // - token_b_vault: 32 bytes (starts at offset 264)
    const VAULT_OFFSET = 232
    const VAULT_LENGTH = 64  // tokenAVault + tokenBVault (32 + 32)

    const accounts = await connection.getProgramAccounts(DAMM_PROGRAM_ID, {
        filters: [
            { dataSize: POOL_ACCOUNT_SIZE },
            { memcmp: { offset: 0, bytes: bs58.encode(POOL_DISCRIMINATOR) } }
        ],
        dataSlice: { offset: VAULT_OFFSET, length: VAULT_LENGTH }
    })

    console.log(`Found ${accounts.length} DAMM v2 pools`)

    // Extract token vault addresses
    const tokenAccounts = []
    accounts.forEach(({ account }) => {
        const data = account.data
        const tokenAVault = new PublicKey(data.slice(0, 32))
        const tokenBVault = new PublicKey(data.slice(32, 64))
        tokenAccounts.push(tokenAVault.toString())
        tokenAccounts.push(tokenBVault.toString())
    })

    return sumTokens2({ tokenAccounts })
}

module.exports = {
    timetravel: false,
    isHeavyProtocol: true,
    solana: { tvl },
    methodology: 'TVL is calculated by summing token balances in Meteora DAMM v2 liquidity pools.'
}