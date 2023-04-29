const ADDRESSES = require('../helper/coreAssets.json')
module.exports = {
    solana: {
      tvl: {
        pools: [
          {
            pool: 'AfhhYsLMXXyDxQ1B7tNqLTXXDHYtDxCzPcnXWXzHAvDb', // Hexapool
            tokens: [
              ADDRESSES.solana.USDC, // Solana-USDC
              ADDRESSES.solana.USDT, // Solana-USDT
              'A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM', // Eth-USDC
              'Dn4noZ5jgGfkntzcQSUZ8czkreiZ1ForXYoV2H8Dm7S1', // Eth-USDT
              ADDRESSES.solana.BUSDbs, // Bsc-BUSD
              ADDRESSES.solana.USDTbs, // Bsc-USDT
            ],
            symbols: [
              "usd-coin",
              "tether",
              "usd-coin",
              "tether",
              "binance-usd",
              "tether",
            ],
          },
          {
            pool: 'Ha7YEA5wRWyH2htfyMXw3VfLbtBHm4UoVXMpq8Ev6zJh', // Meta Avax-USDC
            tokens: [
              'FHfba3ov5P3RjaiLVgh8FTv4oirxQDoVXuoUUDvHuXax', // Avax-USDC
            ],
            symbols: [
              "usd-coin",
            ],
          },
          {
            pool: 'EpvBni7vTfbTG95zf9sNcS9To1NEKnVMpCwZdb21tKsg', // Meta Avax-USDT
            tokens: [
              'Kz1csQA91WUGcQ2TB3o5kdGmWmMGp8eJcDEyHzNDVCX', // Avax-USDT
            ],
            symbols: [
              "tether",
            ],
          },
          {
            pool: '2iLTifF3JDP65AjFKZ3t4mgfJdQVSmVCiM8Zca3TgvpU', // Meta Polygon-USDC
            tokens: [
              'E2VmbootbVCBkMNNxKQgCLMS1X3NoGMaYAsufaAsf7M', // Polygon-USDC
            ],
            symbols: [
              "usd-coin",
            ],
          },
          {
            pool: '3uxBU3fRZzp3V7v9MTNZiDmjxDkKh3rZutLwFtnjJ2pQ', // Meta Polygon-USDT
            tokens: [
              '5goWRao6a3yNC4d6UjMdQxonkCMvKBwdpubU3qhfcdf1', // Polygon-USDT
            ],
            symbols: [
              "tether",
            ],
          },
          {
            pool: '57k3vNmCivSYn7EwQNjcNFcCWAdohZ9xACfMhJGwKiBq', // GSTBNB-GSTSOL
            tokens: [
              'GDuUFXEhUm4jG71vPxYRX3VxUMJ5etGvHTR1iKwTdb6p', // GSTBNB
              'AFbX8oGjGpmVFywbVouvhQSRmiW2aR1mohfahi4Y2AdB', // GSTSOL
            ],
            symbols: [
              "green-satoshi-token-bsc",
              "green-satoshi-token",
            ]
          },
          {
            pool: 'HZr3bF8YEJWMV75Wi3aFEHEyLLk61VyQduXtunWtXNVQ', // GMTBNB-GMTSOL
            tokens: [
              '7dzFD8xQ3FDmVLxwn75UA9WhVnBsUdRAexASVvpXX3Bo', // GMTBNB
              '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx', // GMTSOL
            ],
            symbols: [
              "stepn",
              "stepn",
            ],
          },
          {
            pool: 'DqTF8aZu63iHF55tBz1ePuaBKJ3F2srNVha3B4PpCT4N', // Meta Aurora-USDC
            tokens: [
              '9Y8pJhF8AQGBGL5PTd12P4w82n2qAADTmWakkXSatdAu', // Aurora-USDC
            ],
            symbols: [
              "usd-coin",
            ],
          },
          {
            pool: '23CU3bqMJoRTpvyti84CmPbkAyNJDnTZE7DYj6MnhGdK', // Meta Aurora-USDT
            tokens: [
              'GFhej2oJ1NPLbzSX3D3B9jzYaidff6NoBAUNmu6dLXwU', // Aurora-USDT
            ],
            symbols: [
              "tether",
            ],
          },
          {
            pool: 'H7BkMwbJfLiWE9sSDATHTqXykm1xBjeRzzLDatW2QdEt', // Meta Fantom-USDC
            tokens: [
              'Dnr8fDaswHtYMSKbtR9e8D5EadyxqyJwE98xp17ZxE2E', // Fantom-USDC
            ],
            symbols: [
              "usd-coin",
            ],
          },
          {
            pool: '4XQz1qHMMTkFETn5PSNyLVutYPyZ4han8RB8Mmw1G48Q', // Meta Karura-USDT
            tokens: [
              'E942z7FnS7GpswTvF5Vggvo7cMTbvZojjLbFgsrDVff1', // Karura-USDT
            ],
            symbols: [
              "tether",
            ],
          },
        ],
      }
    },
  }