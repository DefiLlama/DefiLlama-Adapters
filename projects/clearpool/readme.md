# Add a new protocol and network

## To add a new protocol or network 
```
1. Open https://squid.subsquid.io/cpool-squid/v/v1/graphql on browser 
```

```
2. Query `defillamaInfo`

ex. query MyQuery {
  defillamaInfo {
    poolFactory
    protocol
  }
}
```

```
3. Check the newly added protocols and networks, and proceed to hardcode their values in index.js, following the approach used for the existing networks and protocols.
```
```
4. run `npm i -f` to install dependencies.
```

```
5. run `node test.js projects/clearpool/index.js` to test.
```



