import axios, { AxiosRequestConfig } from "axios"

const api_fee = "https://flipsidecrypto.xyz/api/v1/queries/82a54d67-5614-4b3c-b2fa-696396dc5c30/data/latest"


const adapter = {
    adapter: {
        "near": {
          start: '2025-04-16',
          fetch: async () => {
            const fee_result = await httpGet(api_fee);
            const revenue_result = await httpGet(api_revenue);
            return {
                dailyFees: fee_result?.data?.total_fee || '0',
                dailyRevenue: revenue_result?.data.total_revenue || '0',
            }
          }
        }
    }
};

export default adapter;