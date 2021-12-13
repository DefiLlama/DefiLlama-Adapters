const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs.js");

// ETH CONTRACTS
const kine = "0xCbfef8fdd706cde6F208460f2Bf39Aa9c785F05D";
const xKine = "0xa8d7643324df0f38764f514eb1a99d8f379cc692";

const ethPool2 = "0x80850DB68db03792CA5650fbdacCeBe1DA5e52bF"; // KINE-ETH

const kEth = "0xa58e822De1517aAE7114714fB354Ee853Cd35780"; //kETH

const ethCollaterals = [
  "0x1568A7f0bdf67D37DC963c345Dbc4A598859ebA3", // kUSDC
  "0x377f100a7280dd992C6F2503330f893620F586aB", // kWBTC
  "0x63B63b5f0Ae8057cb8f704F65Fd91c19BadD5A73", // kUSDT
];

const kineEthStaking = "0x473ccDeC83B7125a4F52Aa6F8699026FCB878eE8"; // xKINE staking

// BSC CONTRACTS
const kineBscToken = "0xbFa9dF9ed8805E657D0FeaB5d186c6a567752D7F";
const kUsdBsc = "0xd819D96f9D28Ea85C1DD78e66d7241134E8d4aB4";

const xKineBsc = "0x8f5abD0d891D293B13f854700ff89210dA3d5ba3";

const bscPool2 = [
  "0x308043A2a7c62B17906F9B074a349c43ccD919ad", // BUSD-T-kUSD
  "0x6c2C7C5b5c0B60a13B981ACCFe1aa1616985d3D7", // KINE-kUSD
];

const kbnb = "0x5FBe4eB536DADBcee54d5b55eD6559E29C60B055"; // kBNB

const bscCollaterals = [
  "0x3A8502FD810Df171D327e080fB39C734c79B57C2", // kBTCB
  "0x670076F14fb7Bc9735Af1BC9a1D1ad5266f54FA0", // kETH
  "0xD61867501b821befd5E4270A91836f8F7424B847", // kBCH
  "0xf8c7B7709Dd106e70133474BdF05d9d5a87C871f", // kXRP
  "0xa58e822De1517aAE7114714fB354Ee853Cd35780", // kLTC
];

// POLYGON CONTRACTS

const kinePolyToken = "0xa9C1740fA56e4c0f6Ce5a792fd27095C8b6CCd87";
const xKinePoly = "0x66a782C9A077F5aDC988cc0B5fB1CdCc9d7ADeDa"

const kUsdPoly = "0x03324bBc860FBBfd452F6AC0B0b1d76deAFC99a2";

const polyPool2 = [
  "0x69c78C26f272405599382925689D0A54B8Ceedf9", // KINE-USDC
  "0x4D7242a89877Eb044fcCBA6c49E96B4e032a8636", // kUSD-USDC
];

const kMatic = "0xf186A66C2Bd0509BeaAFCa2A16D6c39bA02425f9"; // kMATIC
const polyCollaterals = [
  "0x4F6A33b62017dc804866e6b564C32ed5A57C49Cd", // kPBNB
  "0x96f4516a9d150574cb6d8ae3380f28f330e64ef7", // kWBTC
  "0xc903e8a6811f5e4354ec530F34CC90Bd820Ac1B4", // kETH
];

const xKinePolyStake = "0x6c0ED47f567071Db4207BdFF4F241aF67E972D91";

async function ethTvl(timestamp, block) {
  let balances = {};

  // kETH TVL
  let { output: ethBalance } = await sdk.api.eth.getBalance({
    target: kEth,
    block,
  });
  sdk.util.sumSingleBalance(
    balances,
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    ethBalance
  );

  for (let i = 0; i < ethCollaterals.length; i++) {
    let { output: underlying } = await sdk.api.abi.call({
      target: ethCollaterals[i],
      abi: abi["underlying"],
      block,
    });

    let { output: totalSupply } = await sdk.api.erc20.balanceOf({
      target: underlying,
      owner: ethCollaterals[i],
      block,
    });

    sdk.util.sumSingleBalance(balances, underlying, totalSupply);
  }

  return balances;
}

async function ethPool2Tvl(timestamp, block) {
  balances = {};

  let { output: stakingToken } = await sdk.api.abi.call({
    target: ethPool2,
    abi: abi["stakingToken"],
    block,
  });

  let { output: balance } = await sdk.api.abi.call({
    target: stakingToken,
    params: ethPool2,
    abi: abi["balanceOf"],
    block,
  });

  await unwrapUniswapLPs(
    balances,
    [{ balance, token: stakingToken }],
    block,
    "ethereum",
    (addr) => addr,
    []
  );

  return balances;
}

async function ethStakingTvl(timestamp, block) {
  let balances = {};

  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: xKine,
    owner: kineEthStaking,
    block,
  });

  sdk.util.sumSingleBalance(balances, kine, balance);

  return balances;
}

async function bscTvl(timestamp, block, chainBlocks) {
  let balances = {};

  let { output: bnbBalance } = await sdk.api.eth.getBalance({
    target: kbnb,
    block: chainBlocks["bsc"],
    chain: "bsc",
  });

  sdk.util.sumSingleBalance(
    balances,
    `bsc:${"0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c"}`,
    bnbBalance
  );

  for (let i = 0; i < bscCollaterals.length; i++) {
    let { output: underlying } = await sdk.api.abi.call({
      target: bscCollaterals[i],
      abi: abi["underlying"],
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

    let { output: totalSupply } = await sdk.api.erc20.balanceOf({
      target: underlying,
      owner: bscCollaterals[i],
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

    sdk.util.sumSingleBalance(balances, `bsc:${underlying}`, totalSupply);
  }

  return balances;
}

async function bscPool2Tvl(timestamp, block, chainBlocks) {
  let balances = {};

  for (let i = 0; i < bscPool2.length; i++) {
    let { output: stakingToken } = await sdk.api.abi.call({
      target: bscPool2[i],
      abi: abi["stakingToken"],
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

    let { output: balance } = await sdk.api.abi.call({
      target: stakingToken,
      params: bscPool2[i],
      abi: abi["balanceOf"],
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

    let { output: reserves } = await sdk.api.abi.call({
      target: stakingToken,
      abi: abi["getReserves"],
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

    let { output: totalSupply } = await sdk.api.abi.call({
      target: stakingToken,
      abi: abi["totalSupply"],
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

    let { output: token0 } = await sdk.api.abi.call({
      target: stakingToken,
      abi: abi["token0"],
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

    let { output: token1 } = await sdk.api.abi.call({
      target: stakingToken,
      abi: abi["token1"],
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

    let token0Balance = (balance / totalSupply) * reserves._reserve0;
    let token1Balance = (balance / totalSupply) * reserves._reserve1;

    switch (token0) {
      case kUsdBsc:
        token0 = "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3";
        break;
      case kineBscToken:
        token0 = "0xcbfef8fdd706cde6f208460f2bf39aa9c785f05d";
        sdk.util.sumSingleBalance(balances, token0, token0Balance);
        break;
      default:
        break;
    }

    //Resolving addresses for CoinGecko
    switch (token1) {
      case kUsdBsc:
        token1 = "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3";
        break;
      case kineBscToken:
        token1 = "0xcbfef8fdd706cde6f208460f2bf39aa9c785f05d";
        sdk.util.sumSingleBalance(balances, token1, token0Balance);
        break;
      default:
        break;
    }

    sdk.util.sumSingleBalance(balances, `bsc:${token0}`, token0Balance);
    sdk.util.sumSingleBalance(balances, `bsc:${token1}`, token1Balance);
  }

  return balances;
}

async function bscStaking(timestmap, block, chainBlocks) {
  let balances = {};

  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: kineBscToken,
    owner: xKineBsc,
    block: chainBlocks["bsc"],
    chain: "bsc",
  });

  sdk.util.sumSingleBalance(balances, kine, balance);

  return balances;
}


async function polyTvl(timestamp, block, chainBlocks) {
  let balances = {};

  // kMATIC TVL
  let { output: maticBalance } = await sdk.api.eth.getBalance({
    target: kMatic,
    block: chainBlocks["polygon"],
    chain: "polygon",
  });
  sdk.util.sumSingleBalance(
    balances,
    `polygon:${"0x0000000000000000000000000000000000001010"}`,
    maticBalance
  );

  for (let i = 0; i < polyCollaterals.length; i++) {
    let { output: underlying } = await sdk.api.abi.call({
      target: polyCollaterals[i],
      abi: abi["underlying"],
      block: chainBlocks["polygon"],
      chain: "polygon",
    });

    let { output: totalSupply } = await sdk.api.erc20.balanceOf({
      target: underlying,
      owner: polyCollaterals[i],
      block: chainBlocks["polygon"],
      chain: "polygon",
    });

    sdk.util.sumSingleBalance(balances, `polygon:${underlying}`, totalSupply);
  }

  return balances;
}

async function polyPool2Tvl(timestamp, block, chainBlocks) {
  let balances = {};

  for (let i = 0; i < polyPool2.length; i++) {
    let { output: stakingToken } = await sdk.api.abi.call({
      target: polyPool2[i],
      abi: abi["stakingToken"],
      block: chainBlocks["polygon"],
      chain: "polygon",
    });

    let { output: balance } = await sdk.api.abi.call({
      target: stakingToken,
      params: polyPool2[i],
      abi: abi["balanceOf"],
      block: chainBlocks["polygon"],
      chain: "polygon",
    });

    let { output: reserves } = await sdk.api.abi.call({
      target: stakingToken,
      abi: abi["getReserves"],
      block: chainBlocks["polygon"],
      chain: "polygon",
    });

    let { output: totalSupply } = await sdk.api.abi.call({
      target: stakingToken,
      abi: abi["totalSupply"],
      block: chainBlocks["polygon"],
      chain: "polygon",
    });

    let { output: token0 } = await sdk.api.abi.call({
      target: stakingToken,
      abi: abi["token0"],
      block: chainBlocks["polygon"],
      chain: "polygon",
    });

    let { output: token1 } = await sdk.api.abi.call({
      target: stakingToken,
      abi: abi["token1"],
      block: chainBlocks["polygon"],
      chain: "polygon",
    });

    let token0Balance = (balance / totalSupply) * reserves._reserve0;
    let token1Balance = (balance / totalSupply) * reserves._reserve1;

    switch (token0) {
      case kUsdPoly:
        token0 = "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3";
        break;
      case kinePolyToken:
        token0 = "0xcbfef8fdd706cde6f208460f2bf39aa9c785f05d";
        sdk.util.sumSingleBalance(balances, token0, token0Balance);
        break;
      default:
        break;
    }

    switch (token1) {
      case kUsdPoly:
        token1 = "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3";
        break;
      case kinePolyToken:
        token1 = "0xcbfef8fdd706cde6f208460f2bf39aa9c785f05d";
        sdk.util.sumSingleBalance(balances, token1, token0Balance);
        break;
      default:
        break;
    }

    sdk.util.sumSingleBalance(balances, `polygon:${token0}`, token0Balance);
    sdk.util.sumSingleBalance(balances, `polygon:${token1}`, token1Balance);
  }

  return balances;
}

async function polyStaking(timestamp, block, chainBlocks) {
  let balances = {};

  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: xKinePoly,
    owner: xKinePolyStake,
    block: chainBlocks["polygon"],
    chain: "polygon",
  });

  sdk.util.sumSingleBalance(balances, kine, balance);

  return balances;
}


module.exports = {
  ethereum: {
    tvl: ethTvl,
    pool2: ethPool2Tvl,
    staking: ethStakingTvl,
  },
  bsc: {
    tvl: bscTvl,
    pool2: bscPool2Tvl,
    staking: bscStaking,
  },
  polygon: {
    tvl: polyTvl,
    pool2: polyPool2Tvl,
    staking: polyStaking,
  },
};
