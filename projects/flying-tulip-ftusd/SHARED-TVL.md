# Flying Tulip shared-reserve TVL

Flying Tulip ftUSD and Lend share some USDC/USDT lending reserves. Both adapters
use `shared.js` to assign the remaining reserve cash to ftUSD first, up to the
ftUSD strategy's available PositionsManager claim. Lend reports the residual.
Borrowed funds are reported separately and never subtracted from either TVL
result. This allocation prevents the same reserve cash from appearing twice in
the Flying Tulip parent total; it does not grant ftUSD legal priority over other
lenders.

```text
ftUSD shared amount = min(PM available claim, LendingLens cash)
Lend shared amount = LendingLens cash - ftUSD shared amount
```

ftUSD wrapper and strategy idle collateral are outside this shared cash
allocation. Lend's independent reserves use wrapper underlying and strategy
receipt balances. The adapters intentionally do not set `doublecounted`, because
that flag would exclude all of Lend, including unrelated deposits.

The following raw-unit checks were made with both adapters at the same block as
independent LendingLens and PositionsManager calls. Each row has zero idle
wrapper/strategy collateral, so the two reported values sum exactly to cash.

| Chain and block | Asset | Lens cash | ftUSD PM claim | ftUSD reported | Lend reported |
|---|---|---:|---:|---:|---:|
| Ethereum 26182537 | USDC | 2,819,506,836,872 | 2,788,487,871,495 | 2,788,487,871,495 | 31,018,965,377 |
| Ethereum 26182537 | USDT | 1,738,722,096,135 | 1,837,448,927,263 | 1,738,722,096,135 | 0 |
| Sonic 80906979 | USDC | 492,855,453,930 | 785,987,138,787 | 492,855,453,930 | 0 |
| BSC 127387993 | USDC | 1,407,720,144,169,538,155,229 | 55,010,120,467,542,427,883 | 55,010,120,467,542,427,883 | 1,352,710,023,701,995,727,346 |
| BSC 127387993 | USDT | 2,124,917,464,024,836,509,096 | 1,308,656,597,999,999,996,926 | 1,308,656,597,999,999,996,926 | 816,260,866,024,836,512,170 |

Block hashes: Ethereum
`0x93394e493a67b871718662938d604e835e58b9991cca21e79012eeb99ba0d16d`,
Sonic `0x2ded4f9647efb054247f7917db78240a275fc16791b925ddfdd1554bf8bec1e6`,
BSC `0x173c4ce4178fad58f01129c405477c02d7bd9eeb3f1e572b723cdf7e55375fc2`.

Run `node --test tests/flying-tulip-shared-tvl.test.cjs` and the repository's
`node test.js` command for each adapter. The BSC public RPC used for the fixed
check prunes historical state; older BSC replay needs an archive RPC.
