const ADDRESSES = require('../helper/coreAssets.json')

const getHistoricalPricePerStoneABI = {
    "inputs": [
        {
            "internalType": "uint256",
            "name": "round",
            "type": "uint256"
        }
    ],
    "name": "getHistoricalPricePerStone",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
};

const getExpectedETHAmountfromAgETHABI = {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "getExpectedETHAmountfromAgETH",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
};

const yayStoneAddress = '0xe86142af1321eaac4270422081c1EdA31eEcFf0c'
const yayAgETHAddress = '0x0341d2c2CE65B62aF8887E905245B8CfEA2a3b97'

const yayStoneTvl = async (api) => {
    const yayStoneAmount = await api.call({ abi: 'erc20:totalSupply', target: yayStoneAddress })
    const currentRound = await api.call({ abi: 'uint256:getCurrentRound', target: yayStoneAddress })
    const price = await api.call({
        abi: getHistoricalPricePerStoneABI,
        target: yayStoneAddress,
        params: [currentRound-1],
      });

    const ethAmount = yayStoneAmount * price / 1e18

    return ethAmount
}

const yayAgETHTvl = async (api) => {
    const yayAgETHAmount = await api.call({ abi: 'erc20:totalSupply', target: yayAgETHAddress })
    const price = await api.call({
        abi: getExpectedETHAmountfromAgETHABI,
        target: yayAgETHAddress,
        params: [BigInt("1000000000000000000")],
      });

    const ethAmount = yayAgETHAmount * price / 1e18

    return ethAmount
}

const totalTvl = async (api) => {
    const yayStoneTvlResult = await yayStoneTvl(api);
    const yayAgETHTvlResult = await yayAgETHTvl(api);
    
    return api.add(ADDRESSES.null, yayStoneTvlResult + yayAgETHTvlResult);
}

module.exports = {
    start: 0,
    ethereum: {
        tvl: totalTvl
    },
}