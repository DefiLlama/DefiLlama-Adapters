const ADDRESSES = require("../helper/coreAssets.json");

const affluentMarketList = {
    'EQCrEHHG4Ff8TD3PzuH5tFSwHBD3zxeXaosz48jGLebwiiNx': {
        name: "BasicPool",
    },
    'EQBCXQp2sSTJhvnV6DlBqhTsdNMZc_tJcXQJ5XjoWiy-OAge': {
        name: "AdvancedPool"
    },
    'EQAYJdU9JFRcKAwMZv3MqD0QVjBEMGO_4mgwOJtTBOHR22ec': {
        name: "StormUsdtPool"
    },
    'EQCOA3gN3Dk-ml66zux_vuia7mTIBTENKxtomD6TDgnFZXoH': {
        name: "StormAdvancedPool"
    },
    'EQA3m4H3vTUOeXGW-o6AEyZxv6i79tR-i1f4XiW588HJoqND': {
        name: "StormTonPool"
    },
    'EQBQMDjWVLeX0vAUNDTRL-aA665EItLzSvONywKDHXJRCuxB': {
        name: "LendingVaultPool"
    },
    'EQCNgBmHVBRWpMeZE7E92RM-Gecnv88LJaXAlmqn4WAfJIA9': {
        name: "TradoorAdvancedPool"
    },
    'EQA9iTdgsPxvk08idCXQoefGqJGLTDQFy4W34AtEj7Z_25iT': {
        name: "EthenaPool"
    },
};

const affluentTokenList = {
    [ADDRESSES.ton.TON_3]: {
        address: ADDRESSES.ton.TON_3,
        name: "TON",
        symbol: "TON",
        decimals: 9,
        isJetton: true,
    },
    [ADDRESSES.ton.USDT]: {
        address: ADDRESSES.ton.USDT,
        name: "Tether USD",
        symbol: "USDT",
        decimals: 6,
    },
    "EQDIKEz2BYLnTRWo5W5a6moZ9PXNtyOVOFF7noi8Ufv3axz_": {
        address: "EQDIKEz2BYLnTRWo5W5a6moZ9PXNtyOVOFF7noi8Ufv3axz_",
        name: "Factorial TON",
        symbol: "FactorialTON",
        decimals: 9,
    },
    [ADDRESSES.ton.tsTON]: {
        address: ADDRESSES.ton.tsTON,
        name: "Tonstakers TON",
        symbol: "tsTON",
        decimals: 9,
    },
    [ADDRESSES.ton.stTON]: {
        address: "EQDNhy-nxYFgUqzfUzImBEP67Jqsyk2S5_RwNNEYku0k",
        name: "Staked TON",
        symbol: "stTON",
        decimals: 9,
    },
    "EQDtxQqkgIRQQR5hWlrQxiJMtLwjR3rEYNUBbEcvPDwCs1Ng": {
        address: "EQDtxQqkgIRQQR5hWlrQxiJMtLwjR3rEYNUBbEcvPDwCs1Ng",
        name: "Affluent/Strategy-Vault/TON-Multiply-1",
        symbol: "affTONm",
        decimals: 8,
    },
    "EQBzSItiC1vpDUEftDeWDyjgMutf6CIzme16gzn9iNlolpcY": {
        address: "EQBzSItiC1vpDUEftDeWDyjgMutf6CIzme16gzn9iNlolpcY",
        name: "Affluent/Strategy-Vault/USDT-Multiply-1",
        symbol: "affUSDTm",
        decimals: 8,
    },
    "EQAGtgnr1G0XDilGURcOB3pUhl-Lo__J-TaJP0K4ey8cuSaW": {
        address: "EQAGtgnr1G0XDilGURcOB3pUhl-Lo__J-TaJP0K4ey8cuSaW",
        name: "Factorial/Lending-Vault/USDT",
        symbol: "affUSDTl",
        decimals: 6,
    },
    "EQADQ6JcK0NMuNM5uwCcS9bjcn2RTvcxYIZjNlhIhywUrfBN": {
        address: "EQADQ6JcK0NMuNM5uwCcS9bjcn2RTvcxYIZjNlhIhywUrfBN",
        name: "Factorial/Lending-Vault/TON",
        symbol: "affTONl",
        decimals: 9,
    },
    [ADDRESSES.ton.TON_STORM]: {
        address: ADDRESSES.ton.TON_STORM,
        name: "TON Storm LP",
        symbol: "TON-SLP",
        decimals: 9,
    },
    [ADDRESSES.ton.USDT_STORM]: {
        address: ADDRESSES.ton.USDT_STORM,
        name: "USDT Storm LP",
        symbol: "USDT-SLP",
        decimals: 9,
    },
    "EQDYELRHe6sNcHEKX53qWdXG37OK9VEdDWSX1NcubtcYS2KH": {
        address: "EQDYELRHe6sNcHEKX53qWdXG37OK9VEdDWSX1NcubtcYS2KH",
        name: "Tradoor TON TLP",
        symbol: "TON-TLP",
        decimals: 9,
    },
    [ADDRESSES.ton.USDe]: {
        address: ADDRESSES.ton.USDe,
        name: "Ethena USDe",
        symbol: "USDe",
        decimals: 6,
    },
    [ADDRESSES.ton.tsUSDe]: {
        address: ADDRESSES.ton.tsUSDe,
        name: "Ethena tsUSDe",
        symbol: "tsUSDe",
        decimals: 6,
    },
    "EQDXmtbt1-WSP00tSh6N6FH-4lX7LbnrjORClmtmuZqg4Ymm": {
        address: "EQDXmtbt1-WSP00tSh6N6FH-4lX7LbnrjORClmtmuZqg4Ymm",
        name: "Affluent/Strategy-Vault/Ethena-Multiply-1",
        symbol: "affETHENAm",
        decimals: 8,
    },
    "EQA1R_LuQCLHlMgOo1S4G7Y7W1cd0FrAkbA10Zq7rddKxi9k": {
        address: "EQA1R_LuQCLHlMgOo1S4G7Y7W1cd0FrAkbA10Zq7rddKxi9k",
        name: "Tether Gold",
        symbol: "XAUt0",
        decimals: 6,
    },
    "EQBowXTtxDTSMEJbrIIcYzIvSXZ9V5HW2Oo2iSW0chUzod3d": {
        address: "EQBowXTtxDTSMEJbrIIcYzIvSXZ9V5HW2Oo2iSW0chUzod3d",
        name: "Gold Multiply Vault",
        symbol: "affGOLDm",
        decimals: 8,
    },
    "EQD3F7Ex_uxBjxEub8FgeDoYYUSIbAUVyehCb_JSiCVL369T": {
        address: "EQD3F7Ex_uxBjxEub8FgeDoYYUSIbAUVyehCb_JSiCVL369T",
        name: "Ethena Vault",
        symbol: "affUSDe",
        decimals: 8,
    },
};

module.exports = { affluentMarketList, affluentTokenList };