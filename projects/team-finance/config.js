const abi = require("./lockcontract_v3.abi.json");
const abi_v2 = require("./lockcontract.abi.json");


const coreTokenWhitelist = {
    bsc: [
        '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // wbnb
        '0xe9e7cea3dedca5984780bafc599bd69add087d56',  // busd
        '0x55d398326f99059ff775485246999027b3197955',  // usdt
        '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'], // usdc
    ethereum: [
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // weth
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',  // usdc
        '0xdac17f958d2ee523a2206206994597c13d831ec7',  // usdt
        '0x6b175474e89094c44da98b954eedeac495271d0f'], // dai
    polygon: [
        '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',  // wmatic
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',  // usdc
        '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'], // weth
    avalanche: [
        '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',  // wavax
        '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',  // usdc
        '0xc7198437980c041c805a1edcba50c1ce5db95118'], // usdt
    xdai: [
        '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',  // wxdai
        '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',  // weth
        '0x4ECaBa5870353805a9F068101A40E0f32ed605C6',  // usdt
        '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83']  // usdc
}


const ethereumContractData = [
    {
        chain: "ethereum",
        contract: "0xe2fe530c047f2d85298b07d9333c05737f1435fb",
        contractABI: abi,
        trackedTokens: coreTokenWhitelist.ethereum,
        factory: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"
    },
    {
        chain: "ethereum",
        contract: "0xdbf72370021babafbceb05ab10f99ad275c6220a",
        contractABI: abi_v2,
        trackedTokens: coreTokenWhitelist.ethereum,
        factory: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"
    },
    {
        chain: "ethereum",
        contract: "0xc77aab3c6d7dab46248f3cc3033c856171878bd5",
        contractABI: abi_v2,
        trackedTokens: coreTokenWhitelist.ethereum,
        factory: "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"
    },
]

const polygonContractData = [
    {
        chain: "polygon",
        contract: "0x3eF7442dF454bA6b7C1deEc8DdF29Cfb2d6e56c7",
        contractABI: abi_v2,
        trackedTokens: coreTokenWhitelist.polygon,
        factory: "0x5757371414417b8c6caad45baef941abc7d3ab32"
    },
    {
        chain: "polygon",
        contract: "0x586c21a779c24efd2a8af33c9f7df2a2ea9af55c",
        contractABI: abi_v2,
        trackedTokens: coreTokenWhitelist.polygon,
        factory: "0x5757371414417b8c6caad45baef941abc7d3ab32"
    },
]

const avaxContractData = [
    {
        chain: "avax",
        contract: "0x88ada02f6fce2f1a833cd9b4999d62a7ebb70367",
        contractABI: abi_v2,
        trackedTokens: coreTokenWhitelist.avalanche,
        factory: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10"
    },
    {
        chain: "avax",
        contract: "0xe2fe530c047f2d85298b07d9333c05737f1435fb",
        contractABI: abi,
        trackedTokens: coreTokenWhitelist.avalanche,
        factory: "0x9ad6c38be94206ca50bb0d90783181662f0cfa10"
    },
]


const bscContractData = [
    {
        chain: "bsc",
        contract: "0x0c89c0407775dd89b12918b9c0aa42bf96518820",
        contractABI: abi_v2,
        trackedTokens: coreTokenWhitelist.bsc,
        blacklist: [
            '0x6c7c87d9868b1db5a0f62d867baa90e0adfa7cfd',   //TNNS
            '0xf2619476bd0ca0eda08744029c66b62a904c2bf8',   //JRIT
            '0x854b4c305554c5fa72353e31b8480c0e5128a152',   //WEL
            '0x070a08beef8d36734dd67a491202ff35a6a16d97',   // SLP
            '0x9b83f4b893cf061d8c14471aa97ef24c352f5abe',   // ubec-lp
        ]
    },
    {
        chain: "bsc",
        contract: "0x7536592bb74b5d62eb82e8b93b17eed4eed9a85c",
        contractABI: abi_v2,
        trackedTokens: coreTokenWhitelist.bsc,
    },
]

module.exports = {
    ethereumContractData,
    polygonContractData,
    avaxContractData,
    bscContractData
}