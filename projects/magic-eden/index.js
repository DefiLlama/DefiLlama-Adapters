const { sumTokens: sumBitcoinTokens } = require('../helper/chain/bitcoin');
const { magicEden } = require('../helper/bitcoin-book/index.js');
const { sumTokens2: sumSolTokens, } = require('../helper/solana')
const { sumTokens2: sumEvmTokens } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json');

const ME_TOKEN_ADDRESS = 'MEFNBXixkEbait3xn9bkm8WsJzXtVsaJEn4c8Sam21u'

const trustForwarder = [
    '0x5ebc127fae83ed5bdd91fc6a5f5767E259dF5642',
]

const solanaWallets = [
    // Squads Vault "User Incentives
    'AcG5pZLa5c1A6FT8UkVbUNYvwuEKkAQHt5vgxqNPmdXJ',
    // Squads Vault "Euclid"
    'AzcBxq9NMoVxBfvXcuc1Df3vrSwLAa2ZiMstsvSA91jn',
    // Squads Vault "Keiko
    'HSR2SbS9ES96oAVzcaSQ4ExbdRRuzUDKEPXE5aQtohGb',
    // Squads Vault "MEDAO Security
    'FcfYR3GNuvWxgto8YkXLFbMKaDX4R6z39Js2MFH7vuLX',
    //Squads Vault "Ecosystem Development
    '7ooPG7PsdDph3EoN2L4D7Rdb7nFh4ezuJ59pTsWzGhUr',
    //Squads Vault "Foundation
    'DZFrAxJ3LMEw4ULMqT2fuJWPE5BWMFDhnsdbVTzyueHF',
    // Auction House Treasury
    'rFqFJ9g7TGBD8Ed7TPDnvGKZ5pWLPDyxLcvcH2eRCtt',
    //Buyside Sol Escrow Account
    'E9BxDumHh8jZmyj3txRyyUk1KAu3TjuR55DAP4oK1JAp',
    //Buyside Sol Escrow Account
    'HCoMDpjE81LL6S2ffBwrdHmULUrqpirZZKix1zica8DV',
    //Escrow Payment Account
    'CseXi5tprSPBYH6PjRruW9FWHtGuPXLkw913i544aUAu',
    //Escrow Payment Account
    'AWwwcdEuxCb4MCep942KSKmNUUmuvUGBHBZkMrhKNVxL',
    //Escrow Payment Account
    'DWrR2aenAeXaTZm8oZ1V5GSmEXZMaFJxkj8hNtQdftE8',
    //Payment Account
    '8EMedxp8fSSmL1fr6Pn7AmypyZAGfnckcfjTujaeWhFf',
    //Seller Trade State
    'NTYeYJ1wr4bpM5xo6zx5En44SvJFAd35zTxxNoERYqd',
]


module.exports = {
    methodology:
        'TVL includes the tokens held in various Magic Eden controlled wallets on Solana and Bitcoin.',
    bitcoin: {
        tvl: () => sumBitcoinTokens({
            owners: [ magicEden ],
        })
    },
    ethereum: {
        tvl: () => sumEvmTokens({
            owners: trustForwarder,
            tokens: [
                ADDRESSES.null
            ],
            chain: 'ethereum'
        })
    },
    base: {
        tvl: () => sumEvmTokens({
            owners: trustForwarder,
            tokens: [
                ADDRESSES.null
            ],
            chain: 'base'
        })
    },
    arbitrum: {
        tvl: () => sumEvmTokens({
            owners: trustForwarder,
            tokens: [
                ADDRESSES.null
            ],
            chain: 'arbitrum'
        })
    },
    solana: {
        tvl: () => sumSolTokens({
            owners: solanaWallets,
            solOwners: solanaWallets,
            blacklistedTokens: [ ME_TOKEN_ADDRESS ]
        }),
        staking: () => sumSolTokens({
            owners: solanaWallets,
            tokens: [ ME_TOKEN_ADDRESS ]
        })
    }
};
