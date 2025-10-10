const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
    'VAULTS' : ['0xe24e5deba01ab0b5d78a0093442de0864832803e','0xc557529dd252e5a02e6c653b0b88984afa3c8199'],
    "SUPERLEND_PROTOCOL_DATA_PROVIDER": "0x99e8269dDD5c7Af0F1B3973A591b47E8E001BCac",
    'VAULT_TOKENS' : {
        '0xe24e5deba01ab0b5d78a0093442de0864832803e' : {
            "lend" : ADDRESSES.etlk.STXTZ,
            "borrow" : ADDRESSES.etlk.WXTZ,
        },
        '0xc557529dd252e5a02e6c653b0b88984afa3c8199' : {
            "lend" : ADDRESSES.etlk.LBTC,
            "borrow" : ADDRESSES.etlk.WBTC,
        }
    }
}