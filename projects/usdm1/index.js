const axios = require("axios");
const { getTokenSupplies } = require("../helper/solana");

const ETH_USDM1 = "0x90a1717E0dABE37693f79aFe43AE236dc3b65957";
const SOL_USDM1_MINT = "BNgsQdjfWmjoy3cw8T3VXWswHfgCzEMyQzUno8gmzmRC";
const XLM_USDM1_CODE = "USDM1";
// Classic issuer is intentional for Horizon asset supply.
const XLM_USDM1_ISSUER = "GDM5QWWXCMDTQMZAKMYTCI52LA7FWBHAZMU5NJLMIFHDJISJRP2ZWPKC";

const HORIZON = "https://horizon.stellar.org";

// Horizon returns a decimal string with 7 decimals; keep human-readable units.
function stellarAmountToBaseUnits(amountStr) {
    return String(amountStr).trim();
}

async function ethereumTvl(api) {
    const supply = await api.call({
        target: ETH_USDM1,
        abi: "erc20:totalSupply",
    });

    api.add(ETH_USDM1, supply);
}

async function solanaTvl(api) {
    await getTokenSupplies([SOL_USDM1_MINT], { api });
}

async function stellarTvl(api) {
    const url =
        `${HORIZON}/assets?asset_code=${encodeURIComponent(XLM_USDM1_CODE)}` +
        `&asset_issuer=${encodeURIComponent(XLM_USDM1_ISSUER)}`;

    const { data } = await axios.get(url, { timeout: 20_000 });

    const rec = data?._embedded?.records?.[0];
    const amountStr = rec?.amount; // decimal string with 7 dp
    if (!amountStr) return;

    const amount = stellarAmountToBaseUnits(amountStr);

    api.add(`${XLM_USDM1_CODE}:${XLM_USDM1_ISSUER}`, amount);
}

module.exports = {
    timetravel: false,
    methodology:
        "TVL represents total issued USDM1 supply across Ethereum (ERC-20 totalSupply), Solana (SPL mint supply), and Stellar (Horizon asset amount from the classic issuer). Reported as token quantities; pricing handled separately by DefiLlama.",

    ethereum: { tvl: ethereumTvl },
    solana: { tvl: solanaTvl },
    stellar: { tvl: stellarTvl },
};