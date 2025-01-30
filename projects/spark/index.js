const { sumTokens } = require("../helper/chain/fuel");

module.exports = {
    fuel: {
        tvl: (api) =>
            sumTokens({
                api, owners: [                    '0xfe2c524ad8e088f33d232a45dbea43e792861640b71aa1814b30506bf8430ee5', //ETH-USDC
                    '0xdafe498b31f24ea5577055e86bf77e96bcba2c39a7ae47abaa819c303a45a352', //USDC-USDT
                    '0x81e83f73530c262b0dbf5414649a875c48a48144de3c08ff68cb9d54b36f2eaa', //FUEL-USDC

                    '0xe4e4844f78e2e470b590d0c76ffc9f4422a87317377813a181a02c60a60bc774', //USDT-USDC
                    '0x0bef6eb3018d901818978175feccf650b65dee8e3a8f5b59e138bcf1cf1d0db9', //WETH-USDC
                    '0x4391b39d9165917faffb9dcc69d19b6952a6ebf02db593747cf2f5d8298d28c7', //FUEL-ETH
                    '0x272bc2c2d065e8ca22f0473e328f403bb1ba2e85d71f5fa51dcb83393714ff01', //TRUMP-ETH
                    '0xe4f64c6a9facdce0c055ecade9379c8f425411ec3f9523a472d14ce8a4fbce38', //ezETH-USDC
                    '0x12f52412e0ef50d4e38e1d03fd80d0a88fbaa7253e47f0cc48ba4e3049bd9ce4', //pzETH-USDC

                    '0x2eece85eb7c8ec5fd95e639fd6bb7e9dd7103a99d7321521848da246ecef5270', //PSYCHO-USDC
                    '0x59020aadb448c59b48136a3cef110f1ddd2865000146514924f19b83f061ceba', //USDF-USDC
                    '0x979ea6b1e15c1ec8e79eb76b587af89dd2620b383082e9b2c16049b78e97e4e8', //USDT-ETH
                ]
            })
    }
}