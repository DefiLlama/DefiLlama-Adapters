const BASE3D_MAIN_CONTRACT = '0xa73fab6e612aaf9125bf83a683aadcdd6511d3f0';

async function tvl(_, __, ___, { api }) {
  const ethBalance = await api.call({
    abi: {
      "constant": true,
      "inputs": [],
      "name": "totalEthereumBalance",
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
    target: BASE3D_MAIN_CONTRACT,
  });

  return {
    '0x0000000000000000000000000000000000000000': ethBalance
  };
}

module.exports = {
  base: {
    tvl,
  },
  methodology: 'Calculates TVL by checking the ETH balance of the main contract via the totalEthereumBalance function.',
  start: 3331748,
};
