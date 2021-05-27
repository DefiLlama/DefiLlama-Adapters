/*==================================================
  Modules
  ==================================================*/

const _ = require("underscore");
const sdk = require("@defillama/sdk");

const abi = require("./abi.json");
const abiCerc20 = require("./cerc20.json");
const abiCereth2 = require("./cerc20.json");

const BigNumber = require("bignumber.js");

/*==================================================
  Settings
  ==================================================*/

const lending_tokens_per_chain = {
  ethereum: {
    crETH: "0xD06527D5e56A3495252A528C4987003b712860eE",
    crUSDT: "0x797AAB1ce7c01eB727ab980762bA88e7133d2157",
    crUSDC: "0x44fbebd2f576670a6c33f6fc0b00aa8c5753b322",
    crYFI: "0xCbaE0A83f4f9926997c8339545fb8eE32eDc6b76",
    crBAL: "0xcE4Fe9b4b8Ff61949DCfeB7e03bc9FAca59D2Eb3",
    crCOMP: "0x19D1666f543D42ef17F66E376944A22aEa1a8E46",
    crYCRV: "0x9baF8a5236d44AC410c0186Fe39178d5AAD0Bb87",
    crCREAM: "0x892B14321a4FCba80669aE30Bd0cd99a7ECF6aC0",
    crLINK: "0x697256CAA3cCaFD62BB6d3Aa1C7C5671786A5fD9",
    crLEND: "0x8B86e0598616a8d4F1fdAE8b59E55FB5Bc33D0d6",
    crCRV: "0xc7Fd8Dcee4697ceef5a2fd4608a7BD6A94C77480",
    crRENBTC: "0x17107f40d70f4470d20CB3f138a052cAE8EbD4bE",
    crBUSD: "0x1FF8CDB51219a8838b52E9cAc09b71e591BC998e",
    crMTA: "0x3623387773010d9214B10C551d6e7fc375D31F58",
    crYYCRV: "0x4EE15f44c6F0d8d1136c83EfD2e8E4AC768954c6",
    crSUSHI: "0x338286C0BC081891A4Bda39C7667ae150bf5D206",
    crFTT: "0x10FDBD1e48eE2fD9336a482D746138AE19e649Db",
    crYETH: "0x01da76DEa59703578040012357b81ffE62015C2d",
    crSRM: "0xef58b2d5A1b8D3cDE67b8aB054dC5C831E9Bc025",
    crUNI: "0xe89a6D0509faF730BD707bf868d9A2A744a363C7",
    crWNXM: "0xeFF039C3c1D668f408d09dD7B63008622a77532C",
    crSWAG: "0x22B243B96495C547598D9042B6f94B01C22B2e9E",
    crCEL: "0x8b3FF1ed4F36C2c2be675AFb13CC3AA5d73685a5",
    crDPI: "0x2A537Fa9FFaea8C1A41D3C2B68a9cb791529366D",
    crBBTC: "0x7ea9C63E216D5565c3940A2B3d150e59C2907Db3",
    crAAVE: "0x3225E3C669B39C7c8B3e204a8614bB218c5e31BC",
    crBOND: "0xf55BbE0255f7f4E70f63837Ff72A577fbDDbE924",
    crKP3R: "0x903560b1CcE601794C584F58898dA8a8b789Fc5d",
    crHBTC: "0x054B7ed3F45714d3091e82aAd64A1588dC4096Ed",
    crHFIL: "0xd5103AfcD0B3fA865997Ef2984C66742c51b2a8b",
    crCRETH2: "0xfd609a03B393F1A1cFcAcEdaBf068CAD09a924E2",
    crHUSD: "0xD692ac3245bb82319A31068D6B8412796eE85d2c",
    crDAI: "0x92B767185fB3B04F881e3aC8e5B0662a027A1D9f",
    crHEGIC: "0x10a3da2BB0Fae4D591476fd97D6636fd172923a8",
    crESD: "0x3C6C553A95910F9FC81c98784736bd628636D296",
    crCOVER: "0x21011bc93d9e515b9511a817a1ed1d6d468f49fc",
    cr1INCH: "0x85759961b116f1D36fD697855c57A6ae40793D9B",
    crOMG: "0x7Aaa323D7e398be4128c7042d197a2545f0f1fea",
    crUNIV2WBTCETH: "0x011a014d5e8Eb4771E575bB1000318D509230Afa",
    crUNIV2ETHUSDT: "0xE6C3120F38F56deb38B69b65cC7dcAF916373963",
    crUNIV2USDCETH: "0x4Fe11BC316B6d7A345493127fBE298b95AdaAd85",
    crUNIV2DAIETH: "0xcD22C4110c12AC41aCEfA0091c432ef44efaAFA0",
    crXSUSHI: "0x228619CCa194Fbe3Ebeb2f835eC1eA5080DaFbb2",
    crSLPWBTCETH: "0x73f6cBA38922960b7092175c0aDD22Ab8d0e81fC",
    crSLPDAIETH: "0x38f27c03d6609a86FF7716ad03038881320BE4Ad",
    crSLPUSDCETH: "0x5EcaD8A75216CEa7DFF978525B2D523a251eEA92",
    crSLPETHUSDT: "0x5C291bc83d15f71fB37805878161718eA4b6AEe9",
    crSLPSUSHIETH: "0x6BA0C66C48641e220CF78177C144323b3838D375",
    crSLPYFIETH: "0xd532944df6DFd5Dd629E8772F03D4fC861873abF",
    crWBTC: "0x197070723CE0D3810a0E47F06E935c30a480D4Fc",
    crSNX: "0xC25EAE724f189Ba9030B2556a1533E7c8A732E14",
    crSUSD: "0x25555933a8246Ab67cbf907CE3d1949884E82B55",
    crPICKLE: "0xc68251421edda00a10815e273fa4b1191fac651b",
    crAKRO: "0x65883978aDA0e707c3b2BE2A6825b1C4BDF76A90",
    crBBADGER: "0x8B950f43fCAc4931D408F1fcdA55C6CB6cbF3096",
    crOGN: "0x59089279987DD76fC65Bf94Cb40E186b96e03cB3",
    crAMP: "0x2Db6c82CE72C8d7D770ba1b5F5Ed0b6E075066d6",
    crFRAX: "0xb092b4601850E23903A42EaCBc9D8A0EeC26A4d5",
    crALPHA: "0x1d0986Fb43985c88Ffa9aD959CC24e6a087C7e35",
    crUST: "0x51F48b638F82e8765F7a26373A2Cb4CcB10C07af",
    crFTM: "0xc36080892c64821fa8e396bc1bD8678fA3b82b17",
    crRUNE: "0x8379BAA817c5c5aB929b03ee8E3c48e45018Ae41",
    crPERP: "0x299e254A8a165bBeB76D9D69305013329Eea3a3B",
    crRAI: "0xf8445C529D363cE114148662387eba5E62016e20",
    crOCEAN: "0x7C3297cFB4c4bbd5f44b450c0872E0ADA5203112",
    crYVECRV: "0xA87e8e61dfAC8af5944D353Cd26B96B20d5f4D01",
    crYVSTECRV: "0x1bcaFA2C1b3a522E41bAa60C2E318981Ea8D1eb5",
    crYVCurveIB: "0xf7c5314806bb349744Cf5E721F4d3395259B8531",
    crRARI: "0x081FE64df6dc6fc70043aedF3713a3ce6F190a21",
    crSFI: "0x28526Bb33d7230E65E735dB64296413731C5402e",
    crYVCurveIB: "0x45406ba53bB84Cd32A58e7098a2D4D1b11B107F6",
    crYVCurvesETH: "0x6d1B9e01aF17Dd08d6DEc08E210dfD5984FF1C20",
    crYVCurvestETH: "0x1F9b4756B008106C806c7E64322d7eD3B72cB284",
    crARMOR: "0xab10586C918612BA440482db77549d26B7ABF8f7",
    crARNXM: "0xdFFf11DFe6436e42a17B86e7F419Ac8292990393",
    crMLN: "0xDbb5e3081dEf4b6cdD8864aC2aeDA4cBf778feCf",
    crVSP: "0x71cEFCd324B732d4E058AfAcBA040d908c441847",
    crVVSP: "0x1A122348B73B58eA39F822A89e6ec67950c2bBD0",
    crG: "0x523EFFC8bFEfC2948211A05A905F761CBA5E8e9E",
  },
  bsc: {
    crBNB: "0x1ffe17b99b439be0afc831239ddecda2a790ff3a",
    crWBNB: "0x15CC701370cb8ADA2a2B6f4226eC5CF6AA93bC67",
    crBUSD: "0x2bc4eb013ddee29d37920938b96d353171289b7c",
    crBTCB: "0x11883Cdea6bAb720092791cc89affa54428Ce069",
    crXRP: "0xAa46e2c21B7763a73DB48e9b318899253E66e20C",
    crBCH: "0xCb87Cee8c77CdFD310fb3C58ff72e688d46f90b1",
    crETH: "0xb31f5d117541825D6692c10e4357008EDF3E2BCD",
    crLTC: "0x8cc7E2a6de999758499658bB702143FD025E09B2",
    crUSDT: "0xEF6d459FE81C3Ed53d292c936b2df5a8084975De",
    crLINK: "0x3942936782d788ce69155F776A51A5F1C9dd9B22",
    crDOT: "0x53D88d2ffDBE71E81D95b08AE0cA49D0C4A8515f",
    crADA: "0x81C15D3E956e55e77E1f3F257f0A65Bd2725fC55",
    crCREAM: "0x426D6D53187be3288fe37f214e3F6901D8145b62",
    crBAND: "0x738f3810b3dA0F3e6dC8C689D0d72f3b4992c43b",
    crEOS: "0x19eE64850862cFd234e20c0db4edA286f12ec907",
    crDAI: "0x9095e8d707E40982aFFce41C61c10895157A1B22",
    crXTZ: "0xE692714717a89E4F2ab89dd17d8DDdD7bb52De8e",
    crFIL: "0x1aF8c1C3AD36A041cb6678feD86B1E095004fd16",
    crYFI: "0xEA466cd2583A0290b9E7b987a769a7Eb468FB0A5",
    crUNI: "0x3B0Be453a4008EBc2eDd457e7Bd355f1C5469d68",
    crATOM: "0x0E9d900C884964dC4B26db96Ba113825B1a09Baa",
    crUSDC: "0xD83C88DB3A6cA4a32FFf1603b0f7DDce01F5f727",
    crALPHA: "0x264Bc4Ea2F45cF6331AD6C3aC8d7257Cf487FcbC",
    crTWT: "0x2d3bfaDF9BC94E3Ab796029A030e863F1898aA06",
    crCAKE: "0xbf9b95b78bc42f6cf53ff2a0ce19d607cfe1ff82",
    crXVS: "0x4ebdef163ff08ac1d56a89bafefd6c01cc28a48f",
    crBAT: "0x4cB7F1f4aD7a6b53802589Af3B90612C1674Fec4",
    crVAI: "0x84902bd5ccef97648Bf69C5096729A9367043bEb",
    crAUTO: "0xF77DF34F4Bf632Fb5CA928592a73a29A42BCf0B1",
    crRENBTC: "0x7F746A80506a4cafA39938f7C08Ad59cFa6dE418",
    crRENZEC: "0xbE7E1d74AcAE787355169bC61A8729b2040fCe6b",
    crBETH: "0xDCf60E349a5AAeeEcdd2fb6772931FBF3486eD1C",
    crIOTX: "0xc17C8C5b8bB9456c624f8534FdE6cBda2451488C",
    crSXP: "0xa8D75A0D17D2f4F2f4673975Ab8470269D019c96",
    crSUSHI: "0x9B53e7D5e3F6Cc8694840eD6C9f7fee79e7Bcee5",
    crCAKELPCAKEBNB: "0x36CdF5972aCA2b70F10D0f7aF0D95871ABC065d9",
    crCAKELPBNBBUSD: "0x26A490a0F419DcFBEd97E568403654c2746a7110",
    crCAKELPBTCBBNB: "0xe39b9E0366940Eb3CA62b85Ffae838eF0f8B14e0",
    crCAKELPETHBNB: "0x5Fa61a5A65920F90Af970B13b7f28DaEef0440B7",
    crCAKELPUSDTBUSD: "0x19b08fF7D90d63ad109c6FaBB8e0fcC866477A41",
    crCAKELPCAKEBNB: "0x98b7871702B602E65eAEF46051D75ca334f872D0",
    crCAKELPBUSDBNB: "0x7FD568d6a1a11B19427c8cCb90F7bB80E4Ab1C5F",
    crCAKELPBTCBBNB: "0x5eA2dD1DE21Ed3b5316CEF89985EDc66cF9b2a0E",
    crCAKELPETHBNB: "0x9972Dd9912367cF395bEA752ad49D81f33F7cA85",
    crCAKELPUSDTBUSD: "0x04c61EF58a6f1D6c572045a39A5434Ab9Dee69Fb",
  },
  fantom: {
    crWFTM: "0xd528697008aC67A21818751A5e3c58C8daE54696",
    crCREAM: "0xbadaC56c9aca307079e8B8FC699987AAc89813ee",
    crETH: "0xcc3E89fBc10e155F1164f8c9Cf0703aCDe53f6Fd",
    crBTC: "0x20CA53E2395FA571798623F1cFBD11Fe2C114c24",
    crDAI: "0x04c762a5dF2Fa02FE868F25359E0C259fB811CfE",
    crUSDC: "0x328A7b4d538A2b3942653a9983fdA3C12c571141",
    crYFI: "0x0980f2F0D2af35eF2c4521b2342D59db575303F7",
    crSUSHI: "0xB1FD648D8CA4bE22445963554b85AbbFC210BC83",
    crAAVE: "0x79EA17bEE0a8dcb900737E8CAa247c8358A5dfa1",
    crCRV: "0x98d6AFDA3A488bB8B080c66009326466e986D583",
    crBAND: "0x379555965fcdbA7A40e8B5b5eF4786f51ADeeF31",
    crKP3R: "0x73CF8c5D14Aa0EbC89f18272A568319F5BAB6cBD",
    crSUSD: "0xf976C9bc0E16B250E0B1523CffAa9E4c07Bc5C8a",
    crCOVER: "0x5b4058A9000e86fe136Ac896352C4DFD539E32a1",
    crHEGIC: "0x139Dd8Bb6355d20342e08ff013150b1aE5040a42",
    crLINK: "0x4eCEDdF62277eD78623f9A94995c680f8fd6C00e",
    crSNX: "0x1cc6Cf8455f7783980B1ee06ecD4ED9acd94e1c7",
    crSFI: "0x3FaE5e5722C51cdb5B0afD8c7082e8a6AF336Ee8",
    crFRAX: "0x7ef18d0a9C3Fb1A716FF6c3ED0Edf52a2427F716",
  },
};

const iron_bank_tokens = {
  ethereum: {
    cyWETH: "0x41c84c0e2EE0b740Cf0d31F63f3B6F627DC6b393",
    cyDAI: "0x8e595470Ed749b85C6F7669de83EAe304C2ec68F",
    cyY3CRV: "0x7589C9E17BCFcE1Ccaa1f921196FDa177F0207Fc",
    cyLINK: "0xE7BFf2Da8A2f619c2586FB83938Fa56CE803aA16",
    cyYFI: "0xFa3472f7319477c9bFEcdD66E4B948569E7621b9",
    cySNX: "0x12A9cC33A980DAa74E00cc2d1A0E74C57A93d12C",
    cyWBTC: "0x8Fc8BFD80d6A9F17Fb98A373023d72531792B431",
    cyUSDT: "0x48759F220ED983dB51fA7A8C0D2AAb8f3ce4166a",
    cyUSDC: "0x76Eb2FE28b36B3ee97F3Adae0C69606eeDB2A37c",
    cySUSD: "0xa7c4054AFD3DbBbF5bFe80f41862b89ea05c9806",
    cyMUSD: "0xBE86e8918DFc7d3Cb10d295fc220F941A1470C5c",
    cyDUSD: "0x297d4Da727fbC629252845E96538FC46167e453A",
    cyEURS: "0xA8caeA564811af0e92b1E044f3eDd18Fa9a73E4F",
    cySEUR: "0xCA55F9C4E77f7B8524178583b0f7c798De17fD54",
    cyDPI: "0x7736Ffb07104c0C400Bb0CC9A7C228452A732992",
    cyBUSD: "0x09bDCCe2593f0BEF0991188c25Fb744897B6572d",
    cyGUSD: "0xa0E5A19E091BBe241E655997E50da82DA676b083",
    cyCDAI: "0x4F12c9DABB5319A252463E6028CA833f1164d045",
    cyCUSDT: "0xBB4B067cc612494914A902217CB6078aB4728E36",
    cyCUSDC: "0x950027632FbD6aDAdFe82644BfB64647642B6C09",
    cyUSDP: "0xBdDEB563E90F6cBF168a7cDa4927806477e5B6c6",
    cyUNI: "0xFEEB92386A055E2eF7C2B598c872a4047a7dB59F",
    cySUSHI: "0x226F3738238932BA0dB2319a8117D9555446102f",
  },
};

//
const wETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const usdt = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const yyCrv = "0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c";
const yETH = "0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7";
const crYFI = "0xCbaE0A83f4f9926997c8339545fb8eE32eDc6b76";
const crCREAM = "0x892B14321a4FCba80669aE30Bd0cd99a7ECF6aC0";
const cryUSD = "0x4EE15f44c6F0d8d1136c83EfD2e8E4AC768954c6";
const CRETH2 = "0xcBc1065255cBc3aB41a6868c22d1f1C573AB89fd";

const sixDecimals = ["USDT", "USDC"];
const eightDecimals = ["WBTC"];
/*==================================================
  TVL
  ==================================================*/

async function ethereumTvl(timestamp, block) {
  let balances = {};

  //  --- Grab all the getCash values of crERC20 (Lending Contract Addresses) ---
  let cashValArrEth = [];

  let cashValues = (
    await sdk.api.abi.multiCall({
      block,
      calls: _.map(
        Object.values(lending_tokens_per_chain["ethereum"]),
        (address) => ({ target: address })
      ),
      abi: abiCerc20["getCash"],
    })
  ).output;

  cashValues.map((cashVal) => {
    cashValArrEth.push({
      target: cashVal.input.target,
      params: cashVal.output,
    });
  });

  const keyserc20Eth = Object.keys(lending_tokens_per_chain["ethereum"]);
  cashValArrEth.map((cashVal, idx) => {
    const str = keyserc20Eth[idx].substring(2);

    if (sixDecimals.includes(str)) {
      balances[keyserc20Eth[idx].substring(2)] = BigNumber(cashVal.params)
        .div(1e6)
        .toString();
    } else if (eightDecimals.includes(str)) {
      balances[keyserc20Eth[idx].substring(2)] = BigNumber(cashVal.params)
        .div(1e8)
        .toString();
    } else {
      balances[keyserc20Eth[idx].substring(2)] = BigNumber(cashVal.params)
        .div(1e18)
        .toString();
    }
  });

  // --- Grab all the getCash values of cyERC20 (Iron Bank)---
  cashValArrEth = [];

  let cashValuesIronBank = (
    await sdk.api.abi.multiCall({
      block,
      calls: _.map(Object.values(iron_bank_tokens["ethereum"]), (address) => ({
        target: address,
      })),
      abi: abiCerc20["getCash"],
    })
  ).output;

  cashValuesIronBank.map((cashVal) => {
    cashValArrEth.push({
      target: cashVal.input.target,
      params: cashVal.output,
    });
  });

  const keyscyerc20Eth = Object.keys(iron_bank_tokens["ethereum"]);
  cashValArrEth.map((cashVal, idx) => {
    const str = keyserc20Eth[idx].substring(2);

    if (sixDecimals.includes(str)) {
      const val = BigNumber(cashVal.params).div(1e6).integerValue();

      balances[keyscyerc20Eth[idx].substring(2)] = BigNumber(
        balances[keyscyerc20Eth[idx].substring(2)] || 0
      )
        .plus(val)
        .toFixed();
    } else if (eightDecimals.includes(str)) {
      const val = BigNumber(cashVal.params).div(1e8).integerValue();

      balances[keyscyerc20Eth[idx].substring(2)] = BigNumber(
        balances[keyscyerc20Eth[idx].substring(2)] || 0
      )
        .plus(val)
        .toFixed();
    } else {
      const val = BigNumber(cashVal.params).div(1e8).integerValue();

      balances[keyscyerc20Eth[idx].substring(2)] = BigNumber(
        balances[keyscyerc20Eth[idx].substring(2)] || 0
      )
        .plus(val)
        .toFixed();
    }
  });

  // --- Grab the accumulated on CRETH2 (ETH balance and update proper balances key) ---
  try {
    const accumCRETH2 = (
      await sdk.api.abi.call({
        block,
        target: CRETH2,
        params: [],
        abi: abiCereth2["accumulated"],
      })
    ).output;

    const balETH_CRETH2 = BigNumber(accumCRETH2).div(1e18).integerValue();

    balances["ETH"] += BigNumber(balances["ETH"]).plus(balETH_CRETH2);
  } catch (err) {
    console.error(err);
  }

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: "C.R.E.A.M. Swap",
  website: "https://cream.finance",
  token: null,
  category: "dexes",
  start: 1599552000, // 09/08/2020 @ 8:00am (UTC)
  ethereum: {
    tvl: ethereumTvl,
  },
  tvl: ethereumTvl,
};
