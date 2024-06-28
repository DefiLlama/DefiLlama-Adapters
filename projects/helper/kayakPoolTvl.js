const axios = require('axios');

const service = axios.create({
    baseURL: 'https://api.kayakfinance.io',
    timeout: 5000, // 请求超时时间
});

// 请求拦截器
service.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error(error);
        return Promise.reject(error);
    }
);

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('err' + error);
        return Promise.reject(error);
    }
);

async function tvl() {
    try {
        const response = await service({
            url: 'contract-swap-factory',
            method: 'get',
            params: {
                chainName: 'AVAX',
                page: 0,
                size: 1000,
            },
        });
        const records = response.data.data.records;
        if (records.length >= 2) {
            const totalValueLocked = records[0].tvl + records[1].tvl;
            return totalValueLocked;
        } else {
            console.log('Not enough records to calculate TVL');
            return 0;
        }
    } catch (error) {
        console.error('Error fetching TVL:', error);
        throw error;
    }
}

module.exports = {
    tvl: tvl
};
