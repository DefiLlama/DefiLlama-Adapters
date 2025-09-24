📋 DefiLlama PR Template (BESCswap & BESC Hyperchain)

Name (to be shown on DefiLlama):
CHAIN: BESC HyperChain 
DEX: BESCSWAP

Twitter Link:
https://twitter.com/BESCecosystem

List of audit links if any:
https://skynet.certik.com/projects/besc-hyperchain

Website Link:
https://bescswap.com
https://bescfinancial.com

Logo (High resolution, will be shown with rounded borders):
https://ibb.co/qYZm5n3c

Current TVL:
125k

Treasury Addresses (if the protocol has treasury):

Chain:
BESC Hyperchain
Supported on chainlist 

Coingecko ID:
https://www.coingecko.com/en/chains/besc-hyperchain

Coinmarketcap ID:

Short Description (to be shown on DefiLlama):
BESCswap is the flagship AMM DEX on BESC Hyperchain, supporting swaps, liquidity pools, farming, and cross-chain BUSDC pairs.

Token address and ticker if any:
	•	BESC: 0x33e22F85CC1877697773ca5c85988663388883A0
	•	BUSDC: 0xB54aD626E127f0f228dBeab6F2A61e8e6e029A4B

Category (choose only one):
Dexes
Blockchain

Oracle Provider(s):
Internal TWAP oracles (UniswapV2-style on-chain pricing)
http://72.60.125.197:8000/subgraphs/name/bescswap/exchange-v2


Implementation Details:
BESCswap uses a UniswapV2-based factory and router deployed on BESC Hyperchain. The TVL adapter queries the factory to aggregate pool liquidity.

Factory:0x20EE72D1B7E36e97566f31761dfF14eDc35Fbf22
Router:0x2600E57E2044d62277775A925709af0047c28Eb7


forkedFrom:
UniswapV2 / PancakeSwap

methodology:
TVL is calculated as the total liquidity of tokens in all BESCswap AMM pools, valued using token price data from DefiLlama’s pricing adapters.

Github org/user (Optional):
https://github.com/BESCLLC
