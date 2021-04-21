/*==================================================
  Modules
  ==================================================*/

const sdk = require("../../sdk");
const _ = require("underscore");
const BN = require("bignumber.js");

// const abi1 = require("./abis/v1abi.json");
// const abi2 = require("./abis/v2abi.json");
const yerc20 = require("./abis/yerc20.json");
const herc20 = require("./abis/herc20.json");

/*==================================================
    Constants
    ==================================================*/

const etherAddress = "0x0000000000000000000000000000000000000000";
const fDai = "0xab7FA2B2985BCcfC13c6D86b1D5A17486ab1e04C";

async function getYprice(block, coin, amount) {
  let token = await sdk.api.abi.call({
    block,
    target: coin,
    abi: yerc20["token"],
  });
  token = token.output;

  let price = await sdk.api.abi.call({
    block,
    target: coin,
    abi: yerc20["getPricePerFullShare"],
  });
  price = price.output;
  return { token, price: amount.times(BN(price).div(1e18)) };
}
/*==================================================
    TVL
    ==================================================*/
async function tvl(timestamp, block) {
  let blocks = [10867618, 11409366, 11662074, 12089837];
  let Pools = {
    "0x4571753311E37dDb44faA8Fb78a6dF9a6E3c6C0B": {
      // yVault USD
      "0xACd43E627e64355f1861cEC6d3a6688B31a6F952": BN(0), //yDAI
      "0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e": BN(0), //yUSDC
      "0x2f08119C6f07c006695E079AAFc638b8789FAf18": BN(0), //yUSDT
      "0x37d19d1c4E1fa9DC47bD1eA12f742a0887eDa74a": BN(0), //yTUSD
    },
    "0xBf7CCD6C446acfcc5dF023043f2167B62E81899b": {
      // yVault Curve
      "0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c": BN(0), //yCRV
      "0x2994529C0652D127b7842094103715ec5299bBed": BN(0), //yBCRV
    },
    "0xeF034645b9035C106acC04cB6460049D3c95F9eE": {
      // btcsnow
      "0x7Ff566E1d69DEfF32a7b244aE7276b9f90e9D0f6": BN(0), //YcrvRenWSBTC
      "0x9aA8F427A17d6B0d91B6262989EdC7D45d6aEdf8": BN(0), //FcrvRENWBTC
    },
    "0x16BEa2e63aDAdE5984298D53A4d4d9c09e278192": {
      // eth2snow
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": BN(0), //wEth
      "0x898BAD2774EB97cF6b94605677F43b41871410B1": BN(0), // vEth2
      "0xE95A203B1a91a908F9B9CE46459d101078c2c3cb": BN(0), //aETHB
      "0xcBc1065255cBc3aB41a6868c22d1f1C573AB89fd": BN(0), //crETH2
    },
    "0x8470281f5149eb282cE956D8C0E4f2EbBC0C21FC": {
      // fUSD
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": BN(0), //USDC
      [fDai]: BN(0), //fDai
      "0xf0358e8c3CD5Fa238a29301d0bEa3D63A17bEdBE": BN(0), //fUSDC
      "0x053c80eA73Dc6941F518a68E2FC52Ac45BDE7c9C": BN(0), //fUSDT
    },
  };
  //construct balances data for every token
  let tokenBalances = {};
  for (let pool in Pools) {
    for (let coin in Pools[pool]) {
      try {
        const bal = await sdk.api.abi.call({
          block,
          target: coin,
          abi: "erc20:balanceOf",
          params: pool,
        });
        if (bal && bal.output) {
          Pools[pool][coin] = BN(bal.output);
        }
      } catch (e) {}
    }
  }

  var output = {};
  //construct price(TVL) data by unwrapping Yearn & Farm assets
  for (const [index, [key, value]] of Object.entries(Object.entries(Pools))) {
    if (index == 0 || index == 1) {
      // pool 0 & 1
      for (let coin in Pools[key]) {
        // Get yVault's balances in underlying token
        if (index == 1) {
          if (block <= blocks[0]) {
            continue;
          }
        }
        let p = await getYprice(block, coin, Pools[key][coin]);
        if (p.token === "0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B") {
          output["0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8"] = output[
            "0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8"
          ].plus(p.price);
        } else {
          output[p.token] = p.price;
        }
      }
    } else if (index == 2) {
      //pool 2
      for (let coin in Pools[key]) {
        if (block <= blocks[1]) {
          continue;
        }
        if (coin == "0x7Ff566E1d69DEfF32a7b244aE7276b9f90e9D0f6") {
          let p = await getYprice(block, coin, Pools[key][coin]);
          output[p.token] = p.price;
        } else {
          // harvest btc
          // as crvRenBtc;
          let underlyingBal = await sdk.api.abi.call({
            block,
            target: coin,
            abi: herc20["underlyingBalanceWithInvestmentForHolder"],
            params: key,
          });
          output["0x49849C98ae39Fff122806C06791Fa73784FB3675"] = BN(
            underlyingBal.output
          ); // asset: renbtc
        }
      }
    } else if (index == 3) {
      //pool 3
      //eth2snow pool has tvl in Eth, cumulatively. Staked eth price's fluctuates but currently there is no way to provide that information.
      //please improve this part later.
      if (block <= blocks[2]) {
        continue;
      }
      output[etherAddress] = Object.values(Pools[key]).reduce(
        (accumulator, currentValue) => BN(accumulator.plus(currentValue)),
        BN(0)
      );
    } else if (index == 4) {
      //pool 4
      //fUSD pool has tvl in USDC, cumulatively.
      if (block <= blocks[3]) {
        continue;
      }
      let acc = BN(0);
      for (let addr in Pools[key]) {
        const plus =
          addr === fDai
            ? Pools[key][addr].div(BN(10).pow(BN(12)))
            : Pools[key][addr];
        acc = acc.plus(plus);
      }

      output["0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"] = acc;
    }
  }
  return output;
}
/*==================================================
    Exports
    ==================================================*/

module.exports = {
  name: "Snowswap",
  website: "https://snowswap.org/",
  token: "SNOW",
  category: "dexes",
  start: 1599207447, // 01/23/2021 @ 3:44pm (UTC)
  tvl,
};
