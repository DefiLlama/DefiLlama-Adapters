const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const aquaFarmAddress = "0x0ac58Fd25f334975b1B61732CF79564b6200A933";
const newFarmAddress = "0xB87F7016585510505478D1d160BDf76c1f41b53d";

const replacements = {
  "0xa8Bb71facdd46445644C277F9499Dd22f6F0A30C":
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", //beltBNB -> wbnb
  "0x9cb73F20164e399958261c289Eb5F9846f4D1404":
    "0x55d398326f99059ff775485246999027b3197955", // 4belt -> usdt
  "0x51bd63F240fB13870550423D208452cA87c44444":
    "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c", //beltBTC->
  "0xAA20E8Cb61299df2357561C2AC2e1172bC68bc25":
    "0x2170ed0880ac9a755fd29b2688956bd959f933f8", //beltETH->
};

const greenMarkets = {
  "0x24664791B015659fcb71aB2c9C0d56996462082F":
    "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", //BNB
  "0xF701A48e5C751A213b7c540F84B64b5A6109962E":
    "0xb3Cb6d2f8f2FDe203a022201C81a96c167607F15", //GAMMA
  "0x928fa017eBf781947102690c9b176996B2E00f22":
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", //BUSD
  "0xB3A4ce0654524dCF4B5165cee280EbE69a6E8133":
    "0x72B7D61E8fC8cF971960DD9cfA59B8C829D91991", //AQUA
  "0xa5ae8459e710F95ca0C93d73F63a66d9996F1ACE":
    "0x23396cF899Ca06c4472205fC903bDB4de249D6fC", //UST
  "0xcfa5b884689dc09e4503e84f7877d3A583fcceef":
    "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", //BTCB
  "0x66fD9D390De6172691EC0ddF0ac7F231c1f9a434":
    "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", //ETH
  "0x854a534cEFAf8fD20A70C9DC976C4f65324D7B42":
    "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", //USDC
  "0x4c2bddc208B58534EdDC1fba7B2828CAb70797b5":
    "0x55d398326f99059fF775485246999027B3197955", //USDT
  "0x8B2f098411Ce4B32c9D2110FeF257Cf01D006bA5":
    "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3", //DAI
  "0x6022bA7e5A70E1bAA98d47a566F3495A26511b25":
    "0x90c97f71e18723b0cf0dfa30ee176ab653e89f40",   //FRAX
  "0x84a785E400c43D341D5cbCDC7f0dceb49Cae7d00":
    "0x7083609fce4d1d8dc0c979aab8c869ea2c873402",   //DOT
  "0x9B81d1df15fD9C07007d9a9b8fF75D40A5a80D94":
    "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47",   //ADA
  "0xeb23D803Ec8D598662441807456620cF96eb0470":
    "0xcc42724c6683b7e57334c4e856f4c9965ed682bd",   //MATIC
  "0x45646b30c3Bb8c02bCfE10314308a8055E705ebF":
    "0xfea6ab80cd850c3e63374bc737479aeec0e8b9a1",   //SOL
  "0x88FD42E447d39C3259b53623f2536bd855e47C48":
    "0x156ab3346823B651294766e23e6Cf87254d68962",   //LUNA
  "0x4Bdde0904aBB1695775Cc79c69Dd0d61507232e4":
    "0x8b04e56a8cd5f4d465b784ccf564899f30aaf88c",   //aUST
  "0x2a29572b771a8D8057A046fe80C45a77DBB6E804":
    "0x1ce0c2827e2ef14d5c4f29a091d735a204794041",   //AVAX
  "0x820cDE110D5f17b9F985FBb80f10D4f7158F130f":
    "0x0Eb3a705fc54725037CC9e008bDede697f62F335",   //ATOM
  "0x2aCAf66E67876d18CC5a27EB90Aa32b06Ab4785B":
    "0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe",   //XRP
  
};

const stakings = {
  "0x0c6dd143F4b86567d6c21E8ccfD0300f00896442":
    "0xb3Cb6d2f8f2FDe203a022201C81a96c167607F15", //GAMMA
  "0xb7eD4A5AF620B52022fb26035C565277035d4FD7":
    "0x72B7D61E8fC8cF971960DD9cfA59B8C829D91991", //AQUA
  "0x6bD50dFb39699D2135D987734F4984cd59eD6b53": 
   "0xb3Cb6d2f8f2FDe203a022201C81a96c167607F15", //iGamma
  "0x6E7a174836b2Df12599ecB2Dc64C1F9e1576aC45":
    "0x72B7D61E8fC8cF971960DD9cfA59B8C829D91991" //iAqua
};

async function staking(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  let marketLength = Object.keys(stakings).length;

  let balanceObjArray = {}
  for (var i = 0; i < marketLength; i++) {
    let totalSupply = (
      await sdk.api.abi.call({
        target: Object.keys(stakings)[i],
        abi: abi["totalSupply"],
        chain: "bsc",
        block: chainBlocks.bsc,
      })
    ).output;

    let exchangeRateStored = 0;
    if(Object.keys(stakings)[i] == "0x0c6dd143F4b86567d6c21E8ccfD0300f00896442" || 
    Object.keys(stakings)[i] == "0xb7eD4A5AF620B52022fb26035C565277035d4FD7")
    {
      // normal aqua and gamma staking
      exchangeRateStored = (
        await sdk.api.abi.call({
          target: Object.keys(stakings)[i],
          abi: abi["exchangeRateStored"],
          chain: "bsc",
          block: chainBlocks.bsc,
        })
      ).output;
    }

    if(Object.keys(stakings)[i] == "0x6bD50dFb39699D2135D987734F4984cd59eD6b53")
    {
      //infinity gamma staking
      //getting gGamma locked from infinity vaults
      totalSupply = ( await sdk.api.abi.call({
        target: Object.keys(stakings)[i],
        abi: abi["balanceOfGtoken"],
        chain: "bsc",
        block: chainBlocks.bsc,
      })).output;
      //gettting exchange rate between Gamma and gGamma
      exchangeRateStored = (
        await sdk.api.abi.call({
          target: "0x0c6dd143F4b86567d6c21E8ccfD0300f00896442",
          abi: abi["exchangeRateStored"],
          chain: "bsc",
          block: chainBlocks.bsc,
        })
      ).output;
    }

    if(Object.keys(stakings)[i] == "0x6E7a174836b2Df12599ecB2Dc64C1F9e1576aC45")
    {
      //infinity aqua staking
      //getting gAqua locked from infinity vaults
      totalSupply = ( await sdk.api.abi.call({
        target: Object.keys(stakings)[i],
        abi: abi["balanceOfGtoken"],
        chain: "bsc",
        block: chainBlocks.bsc,
      })).output;
      //gettting exchange rate between Aqua and gAqua
      exchangeRateStored = (
        await sdk.api.abi.call({
          target: "0xb7eD4A5AF620B52022fb26035C565277035d4FD7",
          abi: abi["exchangeRateStored"],
          chain: "bsc",
          block: chainBlocks.bsc,
        })
      ).output;
    }

    const marketTvl = (
      (totalSupply * exchangeRateStored) /
      1e18
    ).toLocaleString("fullwide", { useGrouping: false });
    
    let addr = stakings[Object.keys(stakings)[i]];
    if(Object.keys(stakings)[i] == "0x6bD50dFb39699D2135D987734F4984cd59eD6b53")
    {
      //for adding marketTvl from Gamma infinity (iGamma) to gGamma staking
      addr = "0xb3Cb6d2f8f2FDe203a022201C81a96c167607F15";
    }

    if(Object.keys(stakings)[i] == "0x6E7a174836b2Df12599ecB2Dc64C1F9e1576aC45")
    {
      //for adding marketTvl from Aqua infinity (iAqua) to gAqua staking
      addr = "0x72B7D61E8fC8cF971960DD9cfA59B8C829D91991";
    }

    if(balanceObjArray["bsc:" + addr])
      balanceObjArray["bsc:" + addr] += parseInt(marketTvl)
    else
      balanceObjArray["bsc:" + addr] = parseInt(marketTvl)
  }

  k = Object.keys(balanceObjArray);

  //console.log(balanceObjArray);
  for (var i = 0; i < k.length; i++) {
    sdk.util.sumSingleBalance(balances, k[i], balanceObjArray[k[i]]);
  }

  return balances;
};

async function tvl(timestamp, ethBlock, chainBlocks) {
  let balances = {};
  const lps = [];

  let poolLength = (
    await sdk.api.abi.call({
      target: aquaFarmAddress,
      abi: abi["poolLength"],
      chain: "bsc",
      block: chainBlocks.bsc,
    })
  ).output;

  for (var i = 0; i < poolLength; i++) {
    const poolInfo = (
      await sdk.api.abi.call({
        target: aquaFarmAddress,
        abi: abi["poolInfo"],
        chain: "bsc",
        params: i,
        block: chainBlocks.bsc,
      })
    ).output;

    const strategyAddress = poolInfo["strat"];
    const wantAddress = poolInfo["want"];

    const wantSymbol = await sdk.api.erc20.symbol(wantAddress, "bsc");

    const poolTVL = (
      await sdk.api.abi.call({
        target: strategyAddress,
        abi: abi["wantLockedTotal"],
        chain: "bsc",
        block: chainBlocks.bsc,
      })
    ).output;
    if (wantSymbol.output.endsWith("LP")) {
      lps.push({
        token: wantAddress,
        balance: poolTVL,
      });
    } else {
      let addr = replacements[wantAddress] ?? wantAddress;
      sdk.util.sumSingleBalance(balances, "bsc:" + addr, poolTVL);
    }
  }

  //New Farm

  poolLength = (
    await sdk.api.abi.call({
      target: newFarmAddress,
      abi: abi["poolLength"],
      chain: "bsc",
      block: chainBlocks.bsc,
    })
  ).output;

  for (var i = 0; i < poolLength; i++) {
    const poolInfo = (
      await sdk.api.abi.call({
        target: newFarmAddress,
        abi: abi["poolInfo"],
        chain: "bsc",
        params: i,
        block: chainBlocks.bsc,
      })
    ).output;

    const strategyAddress = poolInfo["strat"];
    const wantAddress = poolInfo["want"];

    const wantSymbol = await sdk.api.erc20.symbol(wantAddress, "bsc");

    const poolTVL = (
      await sdk.api.abi.call({
        target: strategyAddress,
        abi: abi["wantLockedTotal"],
        chain: "bsc",
        block: chainBlocks.bsc,
      })
    ).output;
    if (wantSymbol.output.endsWith("LP")) {
      lps.push({
        token: wantAddress,
        balance: poolTVL,
      });
    } else {
      let addr = replacements[wantAddress] ?? wantAddress;
      sdk.util.sumSingleBalance(balances, "bsc:" + addr, poolTVL);
    }
  }

  //Green Planet

  let a = Object.keys(greenMarkets)
  let marketLength = Object.keys(greenMarkets).length;

  for (var i = 0; i < marketLength; i++) {
    let totalSupply = (
      await sdk.api.abi.call({
        target: Object.keys(greenMarkets)[i],
        abi: abi["totalSupply"],
        chain: "bsc",
        block: chainBlocks.bsc,
      })
    ).output;

    const exchangeRateStored = (
      await sdk.api.abi.call({
        target: Object.keys(greenMarkets)[i],
        abi: abi["exchangeRateStored"],
        chain: "bsc",
        block: chainBlocks.bsc,
      })
    ).output;
      
    let exchangeRateDecimal = 1e18;
    if(Object.keys(greenMarkets)[i] == "0x8b04e56a8cd5f4d465b784ccf564899f30aaf88c")
    {
      exchangeRateDecimal = 1e15
    }

    let marketTvl = (
      (totalSupply * exchangeRateStored) /
      exchangeRateDecimal
    ).toLocaleString("fullwide", { useGrouping: false });
    marketTvl = marketTvl.replace('.','')
    let addr = greenMarkets[Object.keys(greenMarkets)[i]];

    //console.log('addr', addr)
    //console.log('marketTvl', marketTvl)
    sdk.util.sumSingleBalance(balances, "bsc:" + addr, marketTvl);
  }

  await unwrapUniswapLPs(
    balances,
    lps,
    chainBlocks.bsc,
    "bsc",
    (addr) => `bsc:${addr}`
  );
  return balances;
};
// node test.js projects/planet-finance/index.js
module.exports = {
  bsc: {
    tvl,
    staking
  },
};
