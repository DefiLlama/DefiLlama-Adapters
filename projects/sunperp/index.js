const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

const config = {
    tron: {
        vault_address: ["TEubMt2TNag5NN1JXVaeysUk8GNTTYmtVX", "TK8v6HPniRKYixj6Egby712nr5R3xrYYCT", "TYRmcmmKvjL1SFQbvPQtJU1YcaXEnH8dvT"],
        token_address: [ADDRESSES.tron.null, ADDRESSES.tron.USDT, "TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz", ADDRESSES.tron.SUN],
    },
    ethereum: {
        vault_address: ["0x4d1Be6c39Fe3fB1362ff602a6c0CBB5B3BF64eC7", "0xabc02c4f217f5f1d6b1e7e2d3415eae096acb5ad", "0xa9c99a9f70ccf9fcd23fc05f1ebdc76040ebeb1e"],
        token_address: [ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC],
    },
    bsc: {
        vault_address: ["0x4d1Be6c39Fe3fB1362ff602a6c0CBB5B3BF64eC7", "0xabc02c4f217f5f1d6b1e7e2d3415eae096acb5ad", "0xa9c99a9f70ccf9fcd23fc05f1ebdc76040ebeb1e"],
        token_address: [ADDRESSES.bsc.USDT],
    },
    arbitrum: {
        vault_address: ["0x4d1Be6c39Fe3fB1362ff602a6c0CBB5B3BF64eC7", "0xabc02c4f217f5f1d6b1e7e2d3415eae096acb5ad", "0xa9c99a9f70ccf9fcd23fc05f1ebdc76040ebeb1e"],
        token_address: [ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE],
    },
}

module.exports = {
    methodology: "TVL includes Vault Contract and MPC Wallet assets",
};

Object.keys(config).forEach(chain => {
    const data = config[chain]
    module.exports[chain] = {
        tvl: sumTokensExport({ owners: data.vault_address, tokens: data.token_address })
    }
});
