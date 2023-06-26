const ADDRESSES = require('../helper/coreAssets.json')
const vaults_bsc = [
  {
    "sousId": 0,
    "stakingToken": {
      "symbol": "CAKE",
      "address": {
        "56": "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "97": "0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe"
      },
      "decimals": 18,
      "projectLink": "https://pancakeswap.finance/"
    },
    "earningToken": {
      "symbol": "CAKE",
      "address": {
        "56": "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "97": "0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe"
      },
      "decimals": 18,
      "projectLink": "https://pancakeswap.finance/"
    },
    "contractAddress": {
      "56": "0xCd59d44E94Dec10Bb666f50f98cD0B1593dC3a3A",
      "97": ""
    },
    "masterchef": {
      "56": "0x73feaa1eE314F8c655E354234017bE2193C9E24E",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "10",
    "sortOrder": 1,
    "isFinished": true
  },
  {
    "sousId": 1,
    "stakingToken": {
      "symbol": "BAKE",
      "address": {
        "56": "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5",
        "97": "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5"
      },
      "decimals": 18,
      "projectLink": "https://www.bakeryswap.org/"
    },
    "earningToken": {
      "symbol": "BAKE",
      "address": {
        "56": "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5",
        "97": "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5"
      },
      "decimals": 18,
      "projectLink": "https://www.bakeryswap.org/"
    },
    "contractAddress": {
      "56": "0xBB7ac3eB02c6d012cc8e2d916678De8843Eb8A56",
      "97": ""
    },
    "masterchef": {
      "56": "0x20eC291bB8459b6145317E7126532CE7EcE5056f",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.39375",
    "sortOrder": 1,
    "isFinished": true
  },
  {
    "sousId": 2,
    "stakingToken": {
      "symbol": "BANANA",
      "address": {
        "56": "0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://apeswap.finance/"
    },
    "earningToken": {
      "symbol": "BANANA",
      "address": {
        "56": "0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://apeswap.finance/"
    },
    "contractAddress": {
      "56": "0xd474366F6c80230507481495F3C1490e62E3093F",
      "97": ""
    },
    "masterchef": {
      "56": "0x5c8d727b265dbafaba67e050f2f739caeeb4a6f9",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "2.5",
    "sortOrder": 1,
    "isFinished": false
  },
  {
    "sousId": 3,
    "stakingToken": {
      "symbol": "BAKE",
      "address": {
        "56": "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5",
        "97": "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5"
      },
      "decimals": 18,
      "projectLink": "https://www.bakeryswap.org/"
    },
    "earningToken": {
      "symbol": "BAKE",
      "address": {
        "56": "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5",
        "97": "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5"
      },
      "decimals": 18,
      "projectLink": "https://www.bakeryswap.org/"
    },
    "contractAddress": {
      "56": "0x6dAc44A858Cb51e0d4d663A6589D2535A746607A",
      "97": ""
    },
    "masterchef": {
      "56": "0x6a8DbBfbB5a57d07D14E63E757FB80B4a7494f81",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.025315565",
    "sortOrder": 1,
    "isFinished": false
  }
]

const choco_pools_bsc = [
  {
    "sousId": 0,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "contractAddress": {
      "56": "0xFcDE390bF7a8B8614EC11fa8bde7565b3E64fe0b",
      "97": "0x09B7e4A3E9d3c5d5Da59B2F371ABC3a81Ff6c443"
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.0715",
    "sortOrder": 1,
    "isFinished": false
  },
  {
    "sousId": 1,
    "stakingToken": {
      "symbol": "CAKE",
      "address": {
        "56": "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "97": "0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe"
      },
      "decimals": 18,
      "projectLink": "https://pancakeswap.finance/"
    },
    "earningToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "contractAddress": {
      "56": "0xCded81aa5Ab3A433CadF77Fd5aC8B6fD973906e1",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.0022",
    "sortOrder": 3,
    "isFinished": true,
    "isCLP": true,
    "syrupAddresses": {
      "56": "0x009cF7bC57584b7998236eff51b98A168DceA9B0",
      "97": ""
    }
  },
  {
    "sousId": 3,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "CAKE",
      "address": {
        "56": "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "97": "0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe"
      },
      "decimals": 18,
      "projectLink": "https://pancakeswap.finance/"
    },
    "contractAddress": {
      "56": "0xF69bdcDB577F98753d4890Cc5aCfF3BE00177584",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.002",
    "sortOrder": 4,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 4,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "TAPE",
      "address": {
        "56": "0xf63400ee0420ce5b1ebdee0c942d7de1c734a41f",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://apetools.co/"
    },
    "contractAddress": {
      "56": "0x7DB34B681c759918079C67EeF08868225F34fbcB",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.810185185",
    "sortOrder": 5,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 5,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "TBAKE",
      "address": {
        "56": "0x26d6e280f9687c463420908740ae59f712419147",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://bakerytools.io/"
    },
    "contractAddress": {
      "56": "0x13ED683DDf483d1f0bd2AE02b01D4d1D451D6c5b",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "1.099",
    "sortOrder": 6,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 6,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "BREW",
      "address": {
        "56": "0x790Be81C3cA0e53974bE2688cDb954732C9862e1",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://cafeswap.finance/"
    },
    "contractAddress": {
      "56": "0x0f819C8E6A7c0F0906CBc84b9b1e6642f9634E61",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.00498",
    "sortOrder": 5,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 7,
    "stakingToken": {
      "symbol": "TAPE",
      "address": {
        "56": "0xf63400ee0420ce5b1ebdee0c942d7de1c734a41f",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://apetools.co/"
    },
    "earningToken": {
      "symbol": "TAPE",
      "address": {
        "56": "0xf63400ee0420ce5b1ebdee0c942d7de1c734a41f",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://apetools.co/"
    },
    "contractAddress": {
      "56": "0x903A20CDbAC174250eAcc7437720929f0dE97B99",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.950347",
    "sortOrder": 7,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 8,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "Helmet",
      "address": {
        "56": "0x948d2a81086a075b3130bac19e4c6dee1d2e3fe8",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://www.helmet.insure/"
    },
    "contractAddress": {
      "56": "0x82cF07a989835b68260989F13Bc853f8fe48ad04",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.06510416",
    "sortOrder": 3,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 9,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "HOTCROSS",
      "address": {
        "56": "0x4FA7163E153419E0E1064e418dd7A99314Ed27b6",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://www.hotcross.com/"
    },
    "contractAddress": {
      "56": "0xc8De98F603af53a5D52AF6AA153d9e15b0002B2c",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.0992476",
    "sortOrder": 3,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 10,
    "stakingToken": {
      "symbol": "SMG",
      "address": {
        "56": "0x6bfd576220e8444ca4cc5f89efbd7f02a4c94c16",
        "97": ""
      },
      "decimals": 8,
      "projectLink": "https://smaugs.com/"
    },
    "earningToken": {
      "symbol": "SMG",
      "address": {
        "56": "0x6bfd576220e8444ca4cc5f89efbd7f02a4c94c16",
        "97": ""
      },
      "decimals": 8,
      "projectLink": "https://smaugs.com/"
    },
    "contractAddress": {
      "56": "0xf3D514263239672455306D188DD5f045E61deD03",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.138",
    "sortOrder": 3,
    "isFinished": true,
    "isCLP": false
  },
  {
    "sousId": 11,
    "stakingToken": {
      "symbol": "SMG",
      "address": {
        "56": "0x6bfd576220e8444ca4cc5f89efbd7f02a4c94c16",
        "97": ""
      },
      "decimals": 8,
      "projectLink": "https://smaugs.com/"
    },
    "earningToken": {
      "symbol": "SMG",
      "address": {
        "56": "0x6bfd576220e8444ca4cc5f89efbd7f02a4c94c16",
        "97": ""
      },
      "decimals": 8,
      "projectLink": "https://smaugs.com/"
    },
    "contractAddress": {
      "56": "0xC85C50988AEC8d260853443B345CAE63B7432b7A",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.138",
    "sortOrder": 3,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 12,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "DUEL",
      "address": {
        "56": "0x297817ce1a8de777e7ddbed86c3b7f9dc9349f2c",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://www.duel.network/"
    },
    "contractAddress": {
      "56": "0xF60EDbF7D95E79878f4d448F0CA5622479eB8790",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.11574",
    "sortOrder": 2,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 13,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "CAKE",
      "address": {
        "56": "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "97": "0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe"
      },
      "decimals": 18,
      "projectLink": "https://pancakeswap.finance/"
    },
    "contractAddress": {
      "56": "0x99d3334CC9dF44Fb2788C2161FB296fb6Cf14a57",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.001",
    "sortOrder": 3,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 14,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "wBNB",
      "address": {
        "56": ADDRESSES.bsc.WBNB,
        "97": "0xae13d989dac2f0debff460ac112a837c89baa7cd"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "contractAddress": {
      "56": "0xD80bdF70b17bA4fDd0383171623D782D00c8be2E",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.000011574",
    "sortOrder": 3,
    "isFinished": false,
    "isCLP": false,
    "isLockPool": true
  },
  {
    "sousId": 15,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "CAKE",
      "address": {
        "56": "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "97": "0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe"
      },
      "decimals": 18,
      "projectLink": "https://pancakeswap.finance/"
    },
    "contractAddress": {
      "56": "0x28D0e8f18FA73824C91ca77e28727d79b815aEF1",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.0008",
    "sortOrder": 3,
    "isFinished": false,
    "isCLP": false,
    "isLockPool": true
  },
  {
    "sousId": 16,
    "stakingToken": {
      "symbol": "TAPE",
      "address": {
        "56": "0xf63400ee0420ce5b1ebdee0c942d7de1c734a41f",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://apetools.co/"
    },
    "earningToken": {
      "symbol": "TAPE",
      "address": {
        "56": "0xf63400ee0420ce5b1ebdee0c942d7de1c734a41f",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://apetools.co/"
    },
    "contractAddress": {
      "56": "0xa71aFD72A7ed03d2ad9D08A20cdadf17b067f33a",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.81",
    "sortOrder": 6,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 17,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "TAPE",
      "address": {
        "56": "0xf63400ee0420ce5b1ebdee0c942d7de1c734a41f",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://apetools.co/"
    },
    "contractAddress": {
      "56": "0x765c1a0b22130d0e8a61dbb125c1eec5710383f1",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.81",
    "sortOrder": 3,
    "isFinished": false,
    "isCLP": false,
    "isLockPool": true
  },
  {
    "sousId": 18,
    "stakingToken": {
      "symbol": "BANANA",
      "address": {
        "56": "0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://apeswap.finance/"
    },
    "earningToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "contractAddress": {
      "56": "0x4f0a992B465C1D8482b4E2a0861B6cAEE8B3171f",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "",
    "sortOrder": 4,
    "isFinished": false,
    "isCLP": false,
    "isLockPool": false,
    "isBBChef": true
  },
  {
    "sousId": 19,
    "stakingToken": {
      "symbol": "BSW",
      "address": {
        "56": "0x965F527D9159dCe6288a2219DB51fc6Eef120dD1",
        "97": ""
      },
      "decimals": 18,
      "projectLink": "https://biswap.org/"
    },
    "earningToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "contractAddress": {
      "56": "0x2a1Bf8e04633e397207d63F234d281fEf781B6F5",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "",
    "sortOrder": 4,
    "isFinished": false,
    "isCLP": false,
    "isLockPool": false,
    "isBBChef": true
  },
  {
    "sousId": 20,
    "stakingToken": {
      "symbol": "CAKE",
      "address": {
        "56": "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "97": "0xa35062141Fa33BCA92Ce69FeD37D0E8908868AAe"
      },
      "decimals": 18,
      "projectLink": "https://pancakeswap.finance/"
    },
    "earningToken": {
      "symbol": "MCRN",
      "address": {
        "56": "0xacb2d47827c9813ae26de80965845d80935afd0b",
        "97": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "contractAddress": {
      "56": "0x7C454456fc9E86EA1cF1e524FF8B8EbA613189E5",
      "97": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "",
    "sortOrder": 1,
    "isFinished": false,
    "isCLP": false,
    "isLockPool": false,
    "isBBChef": true
  }
]

const choco_pools_polygon = [
  {
    "sousId": 0,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "137": "0xba25b552c8a098afdf276324c32c71fe28e0ad40",
        "80001": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "MCRN",
      "address": {
        "137": "0xba25b552c8a098afdf276324c32c71fe28e0ad40",
        "80001": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "contractAddress": {
      "137": "0xC200cE4853d97e5f11320Bb8ee17F4D895f5e7BB",
      "80001": "0xcE702936B63B6C9c3E059b315807BbE6212F1647"
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.0085",
    "sortOrder": 1,
    "isFinished": false
  },
  {
    "sousId": 1,
    "stakingToken": {
      "symbol": "QUICK",
      "address": {
        "137": "0x831753dd7087cac61ab5644b308642cc1c33dc13",
        "80001": ""
      },
      "decimals": 18,
      "projectLink": "https://quickswap.exchange/"
    },
    "earningToken": {
      "symbol": "MCRN",
      "address": {
        "137": "0xba25b552c8a098afdf276324c32c71fe28e0ad40",
        "80001": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "contractAddress": {
      "137": "0xDeC7950840a32010410dcfFDC735911151604Ba5",
      "80001": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.002",
    "sortOrder": 2,
    "isFinished": true,
    "isCLP": true,
    "syrupAddresses": {
      "137": "0xf28164A485B0B2C90639E47b0f377b4a438a16B1",
      "80001": ""
    }
  },
  {
    "sousId": 2,
    "stakingToken": {
      "symbol": "QUICK",
      "address": {
        "137": "0x831753dd7087cac61ab5644b308642cc1c33dc13",
        "80001": ""
      },
      "decimals": 18,
      "projectLink": "https://quickswap.exchange/"
    },
    "earningToken": {
      "symbol": "MCRN",
      "address": {
        "137": "0xba25b552c8a098afdf276324c32c71fe28e0ad40",
        "80001": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "contractAddress": {
      "137": "0x4b68bA327Cad4d8C4d0Bc783d686d08CFAa5C5D3",
      "80001": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.002",
    "sortOrder": 3,
    "isFinished": false,
    "isCLP": true,
    "syrupAddresses": {
      "137": "0xf28164A485B0B2C90639E47b0f377b4a438a16B1",
      "80001": ""
    }
  },
  {
    "sousId": 3,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "137": "0xba25b552c8a098afdf276324c32c71fe28e0ad40",
        "80001": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "QUICK",
      "address": {
        "137": "0x831753dd7087cac61ab5644b308642cc1c33dc13",
        "80001": ""
      },
      "decimals": 18,
      "projectLink": "https://quickswap.exchange/"
    },
    "contractAddress": {
      "137": "0xdb5640313fc4c958D3Fb2CF546d57dF142882acf",
      "80001": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.0000125",
    "sortOrder": 4,
    "isFinished": false,
    "isCLP": false
  },
  {
    "sousId": 4,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "137": "0xba25b552c8a098afdf276324c32c71fe28e0ad40",
        "80001": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "QUICK",
      "address": {
        "137": "0x831753dd7087cac61ab5644b308642cc1c33dc13",
        "80001": ""
      },
      "decimals": 18,
      "projectLink": "https://quickswap.exchange/"
    },
    "contractAddress": {
      "137": "0x337CC5daBaf1f874ACec0031d3d682CAF6DD2FC8",
      "80001": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.0000125",
    "sortOrder": 3,
    "isFinished": false,
    "isCLP": false,
    "isLockPool": true
  },
  {
    "sousId": 5,
    "stakingToken": {
      "symbol": "MCRN",
      "address": {
        "137": "0xba25b552c8a098afdf276324c32c71fe28e0ad40",
        "80001": "0xfb53da50e544b06ecdc6827ab0df60a3b3801021"
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "earningToken": {
      "symbol": "wMATIC",
      "address": {
        "137": ADDRESSES.polygon.WMATIC_2,
        "80001": ""
      },
      "decimals": 18,
      "projectLink": "https://macaronswap.finance/"
    },
    "contractAddress": {
      "137": "0xA7661a7aeAF507a7782C230a45a002519cFC158C",
      "80001": ""
    },
    "poolCategory": "Core",
    "harvest": true,
    "tokenPerBlock": "0.00195216",
    "sortOrder": 2,
    "isFinished": false,
    "isCLP": false,
    "isLockPool": true
  }
]

module.exports = {
  bsc: {
    masterchef: '0xFcDE390bF7a8B8614EC11fa8bde7565b3E64fe0b',
    token: '0xacb2d47827c9813ae26de80965845d80935afd0b'.toLowerCase(),
    chocochef: 'https://api.macaronswap.finance/chocofalls?chainId=56',
    pools: choco_pools_bsc,
    masterchefPools: 'https://api.macaronswap.finance/magicboxes?chainId=56',
    vaults: 'https://api.macaronswap.finance/boostpools',
    vaults_json: vaults_bsc,
    LPs: [
      '0xe8D5d81dac092Ae61d097f84EFE230759BF2e522'.toLowerCase(),
      '0xc8f900cd8052862a8a5abf9278ad088611b2bd04'.toLowerCase(),
    ],
    erc20s: [
      //MCRN
      // "0xacb2d47827c9813ae26de80965845d80935afd0b",
      //BANANA
      "0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95",
      //CAKE
      "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",

    ],
    treasury: "0x67f1D48a8991009e0b092e9C34ca16f7d6072ec1",
    chainId: 56,
  },
  polygon: {
    masterchef: '0xC200cE4853d97e5f11320Bb8ee17F4D895f5e7BB',
    token: '0xba25b552c8a098afdf276324c32c71fe28e0ad40'.toLowerCase(),
    chocochef: 'https://api.macaronswap.finance/chocofalls?chainId=137',
    pools: choco_pools_polygon,
    LPs: [
      '0xfc53defcF4e21B868DaCEAA6350D507493F57110'.toLowerCase(),
      '0xde84c8f0562eB56A5fc8f07819cEF1FAf9Df3EBc'.toLowerCase(),
    ],
    masterchefPools: 'https://api.macaronswap.finance/magicboxes?chainId=137',
    chainId: 137,
  }
}
