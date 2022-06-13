const abi = require("./lockcontract_v3.abi.json");

const ethereumContractData = [
    { // Uniswap v2
        chain: "ethereum",
        contract: "0xe2fe530c047f2d85298b07d9333c05737f1435fb",
        contractABI: abi,
    }
]

module.exports = {
    ethereumContractData,
}