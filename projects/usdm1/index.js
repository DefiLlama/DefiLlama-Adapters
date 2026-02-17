const axios = require("axios");

const ETH_USDM1 = "0x90a1717E0dABE37693f79aFe43AE236dc3b65957";
const SOL_USDM1_MINT = "BNgsQdjfWmjoy3cw8T3VXWswHfgCzEMyQzUno8gmzmRC";
const XLM_USDM1_CODE = "USDM1";
const XLM_USDM1_ISSUER = "GDM5QWWXCMDTQMZAKMYTCI52LA7FWBHAZMU5NJLMIFHDJISJRP2ZWPKC";

const SOL_RPC = "https://api.mainnet-beta.solana.com";
const HORIZON = "https://horizon.stellar.org";

/**
 * Stellar Horizon returns "amount" as decimal string with 7 decimals.
 * Convert to integer base units (10^7) safely (no floats).
 */
function stellarAmountToBaseUnits(amountStr) {
    const s = String(amountStr).trim();
    const [intPartRaw, fracRaw = ""] = s.split(".");
    const intPart = intPartRaw.length ? intPartRaw : "0";
    const frac = (fracRaw + "0000000").slice(0, 7);
    return (BigInt(intPart) * 10n ** 7n + BigInt(frac)).toString();
}

async function ethereumTvl(api) {
    const supply = await api.call({
        target: ETH_USDM1,
        abi: "erc20:totalSupply",
    });

    api.add(ETH_USDM1, supply);
}

async function solanaTvl(api) {
    const { data } = await axios.post(
        SOL_RPC,
        {
            jsonrpc: "2.0",
            id: 1,
            method: "getTokenSupply",
            params: [SOL_USDM1_MINT],
        },
        { timeout: 20_000 }
    );

    const amount = data?.result?.value?.amount; // integer string
    if (!amount) return;

    api.add(`${SOL_USDM1_MINT}`, amount);
}

async function stellarTvl(api) {
    const url =
        `${HORIZON}/assets?asset_code=${encodeURIComponent(XLM_USDM1_CODE)}` +
        `&asset_issuer=${encodeURIComponent(XLM_USDM1_ISSUER)}`;

    const { data } = await axios.get(url, { timeout: 20_000 });

    const rec = data?._embedded?.records?.[0];
    const amountStr = rec?.amount; // decimal string with 7 dp
    if (!amountStr) return;

    const baseUnits = stellarAmountToBaseUnits(amountStr);

    api.add(`${XLM_USDM1_CODE}:${XLM_USDM1_ISSUER}`, baseUnits);
}

module.exports = {
    timetravel: false,
    methodology:
        "TVL represents total issued USDM1 supply across Ethereum (ERC-20 totalSupply), Solana (SPL mint supply), and Stellar (Horizon asset amount). Reported as token quantities; pricing handled separately by DefiLlama.",

    ethereum: { tvl: ethereumTvl },
    solana: { tvl: solanaTvl },
    stellar: { tvl: stellarTvl },
};