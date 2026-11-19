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

async function addCreditPoolTvl(api, vault, vaultFromBlock) {
    const { tokens } = await getUnderlyings(api, vault, vaultFromBlock);

    await api.sumTokens({ owner: vault, tokens });
}

async function addCreditPoolBorrowed(api, vault, vaultFromBlock) {
    const { lps, tokens } = await getUnderlyings(api, vault, vaultFromBlock);
    let v2Locked = await api.multiCall({ abi: 'uint256:totalUnderlying', calls: lps });
    let cashBalances = await api.multiCall({ abi: 'erc20:balanceOf', calls: tokens.map(token => ({ target: token, params: [vault] })) });

    tokens.forEach((token, i) => {
        const locked = BigInt(v2Locked[i]);
        const cash = BigInt(cashBalances[i]);
        if (locked > cash) api.add(token, locked - cash);
    });
}


module.exports = {
    addCreditPoolTvl,
    addCreditPoolBorrowed
}