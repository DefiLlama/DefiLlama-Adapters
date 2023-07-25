const { getBalance2 } = require("../helper/chain/cosmos.js");

const erc20Contracts = [
    
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
    "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // wstETH
    "0xEa5A82B35244d9e5E48781F00b11B14E627D2951", // ATOM
    "0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9", // WLUNC
    "0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006", // pSTAKE
    "0x45804880De22913dAFE09f4980848ECE6EcbAf78", // PAXG
    "0xc0a4Df35568F116C370E6a6A6022Ceb908eedDaC", // UMEE
    "0x44017598f2AF1bD733F9D87b5017b4E7c1B28DDE", // stkATOM
    "0x817bbDbC3e8A1204f3691d14bB44992841e3dB35", // CUDOS
    "0x467719aD09025FcC6cF6F8311755809d45a5E5f3", // AXL
    "0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44", // WTAO
    "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", // SHIB
    "0x35a532d376FFd9a705d0Bb319532837337A398E7", // WDOGE
    "0x93581991f68DBaE1eA105233b67f7FA0D6BDeE7b", // WEVMOS
    "0x514910771AF9Ca656af840dff83E8264EcF986CA", // LINK
    "0xa670d7237398238DE01267472C6f13e5B8010FD1", // SOMM
    "0xd3E4Ba569045546D09CF021ECC5dFe42b1d7f6E4", // MNW
    "0xd23Ed8cA350CE2631F7EcDC5E6bf80D0A1DeBB7B", // PLQ
    "0x07baC35846e5eD502aA91AdF6A9e7aA210F2DcbE", // EROWAN
    "0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b", // CRO
    "0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30", // INJ
    "0x4c11249814f11b9346808179Cf06e71ac328c1b5", // ORAI
    "0x4Fabb145d64652a948d72533023f6E7A623C7C53", // BUSD
    "0x147faF8De9d8D8DAAE129B187F0D02D819126750", // GEO
    "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH
    "0xD8912C10681D8B21Fd3742244f44658dBA12264E", // PLU
    "0x4f6103BAd230295baCF30f914FDa7D4273B7F585", // KI
    "0xed0d5747A9AB03a75fBfEC3228cd55848245B75d", // NGM
    "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0", // MATIC
    "0x892A6f9dF0147e5f079b0993F486F9acA3c87881", //xFUND
    "0x853d955aCEf822Db058eb8505911ED77F175b99e", //FRAX
    "0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85", //FET
    "0x467719aD09025FcC6cF6F8311755809d45a5E5f3", //AXL
    "0x2B89bF8ba858cd2FCee1faDa378D5cd6936968Be", //WSCRT
    "0x4Fabb145d64652a948d72533023f6E7A623C7C53", //BUSD
    "0x4c11249814f11b9346808179Cf06e71ac328c1b5", //ORAI
    "0xa693B19d2931d498c5B318dF961919BB4aee87a5", //WUST
    "0xBA11D00c5f74255f56a5E366F4F77f5A186d7f55", //BAND
    "0x4547254E6E3195cE57Bc50352193A25c2F4B8FCf", //STARS
    "0x7bE48633D86AA9821284B01030b8a3F9B06eA876", //HUAHUA
    "0x6982508145454Ce325dDbE47a25d4ec3d2311933", //PEPE
    "0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9", //WLUNC
    "0x43373AE537945085Ee1001928E96204034bF55e6", //USDC2
    "0x76C4A2B59523eaE19594c630aAb43288dBB1463f", //IRIS

  ];

  const maxSupplyContracts = [

    "0x2C4F1DF9c7DE0C59778936C9b145fF56813F3295", //MNTL
    "0x525A8F6F3Ba4752868cde25164382BfbaE3990e1", //NYM
    "0xdaf0b40b961CA51Fc914fbabdA8E779619576caD", //ATOMIBC
    "0x96543ef8d2C75C26387c1a319ae69c0BEE6f3fe7", //KUJI
    "0xe9B076B476D8865cDF79D1Cf7DF420EE397a7f75", //FUND
    "0x1B3C515F58857E141A966b33182f2F3feECC10E9", //USK
    "0x3b484b82567a09e2588A13D54D032153f0c0aEe0", //SOS

  ];

  const GRAVITY_BRIDGE_CONTRACT = "0xa4108aa1ec4967f8b52220a4f7e94a8201f2d906";
  // Function to get the TVL
  async function getBridgeTVL(_, ethBlock, _2, { api }) {
    let tvl = {};
  
    // Get balances for normal ERC20 tokens
    for (let contractAddress of erc20Contracts) {
        try {
          let balance = await api.call({
            target: contractAddress,
            params: [GRAVITY_BRIDGE_CONTRACT],
            abi: 'erc20:balanceOf',
            block: ethBlock
          });
  
          // Assign the balance directly without converting to decimal
          tvl[contractAddress] = balance.toString();

          console.log("token:", contractAddress, balance.toString())
  
          // Log output
        } catch (err) {
          console.error(`Failed to fetch balance for ${contractAddress}`, err);
        }
    }
  
    // Get max supply for the other tokens
    for (let contractAddress of maxSupplyContracts) {
        try {
          let maxSupply = await api.call({
            target: contractAddress,
            abi: 'erc20:totalSupply',
            block: ethBlock
          });
  
          // Assign the max supply directly without converting to decimal
          tvl[contractAddress] = maxSupply.toString();
  
          // Log output
        } catch (err) {
          console.error(`Failed to fetch max supply for ${contractAddress}`, err);
        }
    }
    
    return tvl;
  }
  
  async function getTVLandBalance(_, ethBlock, _2, { api }) {
    let tvl = await getBridgeTVL(_, ethBlock, _2, { api });

    const chain = "gravityBridge";
    const owner = "gravity16n3lc7cywa68mg50qhp847034w88pntqzx3ksm";
    const block = undefined;

    let balances = await getBalance2({owner, chain, block});
    console.log("Module account balances:", balances);

    return tvl;
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Counts the tokens locked in the Gravity Bridge contract on Ethereum chain.',
    start:  13798211,
    ethereum: {
      tvl: getTVLandBalance,
    },
};