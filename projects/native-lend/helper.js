const { getLogs2 } = require('../helper/cache/getLogs')

async function getUnderlyings(api, vault, vaultFromBlock) {
    const lpListedLogs = await getLogs2({
        api,
        target: vault,
        topic: "MarketListed(address)",
        eventAbi: "event MarketListed(address lpToken)",
        fromBlock: vaultFromBlock,
      });
    const lps = lpListedLogs.map((i) => i.lpToken);
    const tokens = await api.multiCall({ abi: 'address:underlying', calls: lps });
    return { lps, tokens };
}

// totalUnderlying() on each lpToken is the full amount owed to LPs (cash still
// sitting in the vault plus whatever's currently lent out to PMMs). The vault's
// own token balance only reflects the cash portion, so TVL must also include
// the borrowed-out excess (totalUnderlying - cash) or it silently undercounts
// whenever there's an active loan. Confirmed on-chain: ethereum WETH market had
// totalUnderlying ~6,247 WETH vs vault cash ~3,933 WETH, a ~37% gap.
async function addBorrowedExcess(api, vault, lps, tokens) {
    let v2Locked = await api.multiCall({ abi: 'uint256:totalUnderlying', calls: lps });
    let cashBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(token => ({ target: token, params: [vault] })) });
    tokens.forEach((token, i) => {
        const locked = BigInt(v2Locked[i]);
        const cash = BigInt(cashBalances[i]);
        if (locked > cash) api.add(token, locked - cash);
    });
}

async function addCreditPoolTvl(api, vault, vaultFromBlock) {
    const { lps, tokens } = await getUnderlyings(api, vault, vaultFromBlock);
    await api.sumTokens({ owner: vault, tokens });
    await addBorrowedExcess(api, vault, lps, tokens);
}

async function addCreditPoolBorrowed(api, vault, vaultFromBlock) {
    const { lps, tokens } = await getUnderlyings(api, vault, vaultFromBlock);
    await addBorrowedExcess(api, vault, lps, tokens);
}

module.exports = {
    addCreditPoolTvl,
    addCreditPoolBorrowed
}
