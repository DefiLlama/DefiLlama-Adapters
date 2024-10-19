const SX_ETH_VAULT = "0x466B447D68112090ea46a98E15f22da44f87AF7F";
const WETH_TOKEN_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const eETH_TOKEN_ADDRESS = "0x35fA164735182de50811E8e2E824cFb9B6118ac2";
const ezETH_TOKEN_ADDRESS = "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110";
const rswETH_TOKEN_ADDRESS = "0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0";
const rsETH_TOKEN_ADDRESS = "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7";

async function tvl(api) {
    const [WETH_BALANCE, eETH_BALANCE, ezETH_BALANCE, rswETH_BALANCE, rsETH_BALANCE] = await api.multiCall({
        calls: [
            { target: WETH_TOKEN_ADDRESS, params: SX_ETH_VAULT },
            { target: eETH_TOKEN_ADDRESS, params: SX_ETH_VAULT },
            { target: ezETH_TOKEN_ADDRESS, params: SX_ETH_VAULT },
            { target: rswETH_TOKEN_ADDRESS, params: SX_ETH_VAULT },
            { target: rsETH_TOKEN_ADDRESS, params: SX_ETH_VAULT }
        ],
        abi: 'erc20:balanceOf'
    })
    api.add(WETH_TOKEN_ADDRESS, WETH_BALANCE)
    api.add(eETH_TOKEN_ADDRESS, eETH_BALANCE)
    api.add(ezETH_TOKEN_ADDRESS, ezETH_BALANCE)
    api.add(rswETH_TOKEN_ADDRESS, rswETH_BALANCE)
    api.add(rsETH_TOKEN_ADDRESS, rsETH_BALANCE)
}

module.exports = {
    doublecounted: false,
    ethereum: {
        tvl,
    }
};
