const sdk = require('@defillama/sdk');

const SSL_CONTRACT_1 = '0xDC4a311f0D852934d9b51C0eAc7c7e13EA1DF11b';
const SSL_CONTRACT_2 = '0xDFF4a68044eb68c60354810E9316B2B6DB88B3eb';

async function tvl(_, _block, chainBlocks) {
  try {
    const [totalDepositedAmount1, totalDepositedAmount2] = await Promise.all([
      sdk.api.abi.call({
        abi: {
          "constant": true,
          "inputs": [],
          "name": "totalDepositedAmount",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        target: SSL_CONTRACT_1,
        chain: 'arbitrum',
        block: chainBlocks['arbitrum'],
      }),
      sdk.api.abi.call({
        abi: {
          "constant": true,
          "inputs": [],
          "name": "totalDepositedAmount",
          "outputs": [
            {
              "name": "",
              "type": "uint256"
            }
          ],
          "payable": false,
          "stateMutability": "view",
          "type": "function"
        },
        target: SSL_CONTRACT_2,
        chain: 'arbitrum',
        block: chainBlocks['arbitrum'],
      })
    ]);

    const totalTVL = (Number(totalDepositedAmount1.output) + Number(totalDepositedAmount2.output)) / 1e18;
    return { arbitrum: totalTVL };
  } catch (error) {
    console.error('Error fetching balance:', error);
    return { arbitrum: 0 };
  }
}

module.exports = {
  arbitrum: { tvl },
};
