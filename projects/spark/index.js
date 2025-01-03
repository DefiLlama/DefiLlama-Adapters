const { sumTokens } = require("../helper/chain/fuel");

async function tvl(api) {
    const contractIds = [
        '0xfe2c524ad8e088f33d232a45dbea43e792861640b71aa1814b30506bf8430ee5',
        '0xdafe498b31f24ea5577055e86bf77e96bcba2c39a7ae47abaa819c303a45a352',
        '0x81e83f73530c262b0dbf5414649a875c48a48144de3c08ff68cb9d54b36f2eaa',
    ];

    const balancesList = await Promise.all(
        contractIds.map(async (contractId) => {
            const balances = await sumTokens({ api, owner: contractId });
            console.log(`Balances from contract ${contractId}:`, balances);
            return balances;
        })
    );

    const combinedBalances = balancesList.reduce((acc, balances) => {
        Object.entries(balances).forEach(([key, value]) => {
            const numericValue = BigInt(value || 0);
            acc[key] = acc[key] ? BigInt(Math.max(Number(acc[key]), Number(numericValue))) : numericValue;
        });
        return acc;
    }, {});

    console.log("Final combined balances:", combinedBalances);

    const totalTvl = Object.values(combinedBalances).reduce((sum, value) => {
        return sum + Number(value);
    }, 0);

    const formattedBalances = Object.fromEntries(
        Object.entries(combinedBalances).map(([key, value]) => [key, value.toString()])
    );

    console.log("Formatted Balances for TVL:", formattedBalances);

    return formattedBalances;
}

module.exports = {
    fuel: { tvl },
    timetravel: false,
};