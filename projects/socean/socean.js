const axios = require("axios");

async function tvl() {
    const publicAPIKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyOTIwMTUyOSwiZXhwIjoxOTQ0Nzc3NTI5fQ.nJcAWD5NXaHQJdPc0_J1lNMv-YDx9bpVlPkke91Jx0c'
    const response = await axios.get(
        'https://rvliqpfbqcjhdlrgjkvw.supabase.co/rest/v1/APITable?select=tvl_sol&api_id=eq.1',
        {
            headers: {
                'apikey': publicAPIKey,
            }
        }
    )

    return {
        'solana': response.data[0].tvl_sol / 1_000_000_000 || 0
    }
}

module.exports = {
    tvl,
    methodology: 'We call our API endpoint to get total SOL TVL. An alternative is to check our total supply for a lower bound on TVL, as each SOCN token is guaranteed to be backed by (at least) 1 SOL.',
}
