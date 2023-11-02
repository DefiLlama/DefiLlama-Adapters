const { post } = require('../helper/http')

module.exports = {
    timetravel: false,
    methodology: 'Actual amount of TON staked on Hipo',
    hallmarks: [
        [1698685200, 'Hipo Launch'],
    ],
    ton: {
        tvl: async () => {
            const requestBody = {
                'address': 'EQBNo5qAG8I8J6IxGaz15SfQVB-kX98YhKV_mT36Xo5vYxUa',
                'method': 'get_treasury_state',
                'stack': []
            }
            const response = await post('https://toncenter.com/api/v2/runGetMethod', requestBody)
            if (! response.ok)  {
                throw new Error('Error in calling toncenter.com/api/v2/runGetMethod')
            }
            const result = response.result
            if (result.exit_code !== 0) {
                throw new Error('Expected a zero exit code, but got ' + result.exit_code)
            }
            const currentlyStakedNano = BigInt(result.stack[0][1])
            const currentlyStakedTon = currentlyStakedNano / 1000000000n
            return {
                'coingecko:the-open-network': currentlyStakedTon.toString(),
            }
        },
    },
}
