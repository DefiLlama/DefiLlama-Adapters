const erc20Contracts = {
    "0x6B175474E89094C44Da98b954EedeAC495271d0F": 'DAI',
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": 'USDC',
    "0xdAC17F958D2ee523a2206206994597C13D831ec7": 'USDT',
    "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599": 'WBTC',
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": 'WETH',
    "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0": 'wstETH',
    "0xEa5A82B35244d9e5E48781F00b11B14E627D2951": 'ATOM',
    "0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9": 'WLUNC',
    "0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006": 'pSTAKE',
    "0x45804880De22913dAFE09f4980848ECE6EcbAf78": 'PAXG',
    "0xc0a4Df35568F116C370E6a6A6022Ceb908eedDaC": 'UMEE',
    "0x44017598f2AF1bD733F9D87b5017b4E7c1B28DDE": 'stkATOM',
    "0x817bbDbC3e8A1204f3691d14bB44992841e3dB35": 'CUDOS',
    "0x467719aD09025FcC6cF6F8311755809d45a5E5f3": 'AXL',
    "0x77E06c9eCCf2E797fd462A92B6D7642EF85b0A44": 'WTAO',
    "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE": 'SHIB',
    "0x35a532d376FFd9a705d0Bb319532837337A398E7": 'WDOGE',
    "0x93581991f68DBaE1eA105233b67f7FA0D6BDeE7b": 'WEVMOS',
    "0x514910771AF9Ca656af840dff83E8264EcF986CA": 'LINK',
    "0xa670d7237398238DE01267472C6f13e5B8010FD1": 'SOMM',
    "0xd3E4Ba569045546D09CF021ECC5dFe42b1d7f6E4": 'MNW',
    "0xd23Ed8cA350CE2631F7EcDC5E6bf80D0A1DeBB7B": 'PLQ',
    "0x07baC35846e5eD502aA91AdF6A9e7aA210F2DcbE": 'EROWAN',
    "0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b": 'CRO',
    "0xe28b3B32B6c345A34Ff64674606124Dd5Aceca30": 'INJ',
    "0x4c11249814f11b9346808179Cf06e71ac328c1b5": 'ORAI',
    "0x4Fabb145d64652a948d72533023f6E7A623C7C53": 'BUSD',
    "0x147faF8De9d8D8DAAE129B187F0D02D819126750": 'GEO',
    "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84": 'stETH',
    "0xD8912C10681D8B21Fd3742244f44658dBA12264E": 'PLU',
  };

  const GRAVITY_BRIDGE_CONTRACT = "0xa4108aa1ec4967f8b52220a4f7e94a8201f2d906";
  // Function to get the TVL
  async function getBridgeTVL(_, ethBlock, _2, { api }) {
    let tvl = {};
    
    for (let [contractAddress, tokenSymbol] of Object.entries(erc20Contracts)) {
        let balance = await api.call({
          target: contractAddress,
          params: [GRAVITY_BRIDGE_CONTRACT],
          abi: 'erc20:balanceOf',
          block: ethBlock
        });
      
        // Fetch the number of decimals for the token
        let decimals = await api.call({
          target: contractAddress,
          abi: 'erc20:decimals',
          block: ethBlock
        });
      
        // Convert the returned balance to a decimal format
        let decimalBalance = BigInt(balance) / BigInt(10 ** decimals);
      
        tvl[tokenSymbol] = decimalBalance.toString();
      }
    
    return tvl;
  }
  
  module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology: 'Counts the tokens locked in the Gravity Bridge contract on Ethereum chain.',
    start:  13798211 , // Replace this with the block number when the Gravity Bridge contract was created
    ethereum: {
      tvl: getBridgeTVL,
    },
  };
  