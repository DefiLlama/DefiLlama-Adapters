const { sumTokens2 } = require("../helper/solana");

async function tvl() {
    return await sumTokens2({
        tokenAccounts: [
            '6B8k8At9879r5EsZAWg8W6DEpxzJ798Cwj48twu3pq4b', // USDC
            'DJfYbGicp4AFXWsragNWv1baugqcdFhw6eFTcK2YWdyK', // USDT
            '4jV62TqjV4oUyNBioPo9dJZGyjTcgfBDkuG4VbgxfqWC', // PYSUD
            '3zR26w68Va5qT6J7ZKkbxV6MJVdVxHj5ku7Laogu9VoN', // SUSD
            '3DFmntWjh9PrzsiFnPQeMW773A9m62uVPE6j9YK32QCa', // USDS
            'DqNRPbFHeDwM3JAXJmSutPRJNimaz4pdHjKo6vGx6jfg', // USDY
            'FuSNPqppBECY7vvyFFdDxAkxL67zgoujYEQSpKejfHa2'  // CFUSD
        ]
    });
}

module.exports = {
    timetravel: false,
    solana: { tvl, },
}