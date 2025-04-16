import { httpGet } from "../helper/chain/near";

const api_fee = "https://flipsidecrypto.xyz/api/v1/queries/82a54d67-5614-4b3c-b2fa-696396dc5c30/data/latest"

const adapter = {
    adapter: {
        "near": {
          start: '2025-04-16',
          fetch: async () => {
            const result = await httpGet(payload);
            return {
                tvl: result?.TOTAL_NET_MINTED_VOLUME || '0',
            }
          }
        }
    }
};

export default adapter;