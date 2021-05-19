import config from '../config'
import async from 'async'
import BigNumber from 'bignumber.js'
import { bnToFixed, multiplyBnToFixed, sumArray } from '../utils/numbers'

import {
  MAX_UINT256,
  ZERO_ADDRESS,

  SNACKBAR_ERROR,
  SNACKBAR_TRANSACTION_HASH,
  SNACKBAR_TRANSACTION_RECEIPT,
  ERROR,

  CONFIGURE,
  CONFIGURE_RETURNED,
  GET_BALANCES,
  BALANCES_RETURNED,

  DEPOSIT,
  DEPOSIT_RETURNED,
  GET_DEPOSIT_AMOUNT,
  GET_DEPOSIT_AMOUNT_RETURNED,
  SLIPPAGE_INFO_RETURNED,

  WITHDRAW,
  WITHDRAW_RETURNED,
  GET_WITHDRAW_AMOUNT,

  SWAP,
  SWAP_RETURNED,
  GET_SWAP_AMOUNT,
  SWAP_AMOUNT_RETURNED,

  GET_ASSET_INFO,
  GET_ASSET_INFO_RETURNED,
  ADD_POOL,
  ADD_POOL_RETURNED, 

  GET_PRESELECTED_POOL,
  PRESELECTED_POOL_RETURNED,
  CHANGE_SELECTED_POOL,
  SELECTED_POOL_CHANGED,
  GET_WITHDRAW_AMOUNT_RETURNED
  
} from '../constants'
import Web3 from 'web3'

import {
  injected,
  walletconnect,
  walletlink,
  ledger,
  trezor,
  frame,
  fortmatic,
  portis,
  squarelink,
  torus,
  authereum
} from "./connectors"

const rp = require('request-promise')

const Dispatcher = require('flux').Dispatcher
const Emitter = require('events').EventEmitter

const dispatcher = new Dispatcher()
const emitter = new Emitter()

class Store {
  constructor() {

    this.store = {
      pools: [],
      selectedPool: null,
      underlyingBalances: [],
      basePools: [],
      connectorsByName: {
        MetaMask: injected,
        TrustWallet: injected,
        WalletConnect: walletconnect,
        WalletLink: walletlink,
        Ledger: ledger,
        Trezor: trezor,
        Frame: frame,
        Fortmatic: fortmatic,
        Portis: portis,
        Squarelink: squarelink,
        Torus: torus,
        Authereum: authereum
      },
      account: {},
      web3context: null
    }

    

    dispatcher.register(
      function (payload) {
        switch (payload.type) {
          case CONFIGURE:
            this.configure(payload)
            break
          case GET_BALANCES:
            this.getBalances(payload)
            break
          case DEPOSIT:
            this.deposit(payload)
            break
          case WITHDRAW:
            this.withdraw(payload)
            break
          case SWAP:
            this.swap(payload)
            break
          case GET_SWAP_AMOUNT:
            this.getSwapAmount(payload)
            break
          case GET_ASSET_INFO:
            this.getAssetInfo(payload)
            break
          case ADD_POOL:
            this.addPool(payload)
            break
          case GET_DEPOSIT_AMOUNT:
            this.getDepositAmount(payload)
            break;
          case GET_WITHDRAW_AMOUNT: 
            this.getWithdrawAmount(payload)
            break;
          case GET_PRESELECTED_POOL:
            this.getPreselectedPool(payload)
            break;
          case CHANGE_SELECTED_POOL:
            this.changeSelectedPool(payload)
            break;
          default: {
          }
        }
      }.bind(this)
    )
  }

  getStore(index) {
    return(this.store[index])
  }

  setStore(obj) {
    this.store = {...this.store, ...obj}
    return emitter.emit('StoreUpdated')
  }

  _checkApproval2 = async (asset, account, amount, contract) => {
    try {
      const config = await this._getConfig();
      const web3 = await this._getWeb3Provider()
      const erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)
      const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

      let ethAllowance = web3.utils.fromWei(allowance, "ether")
      if (asset.decimals !== 18) {
        ethAllowance = (allowance*10**asset.decimals).toFixed(0)
      }

      var amountToSend = MAX_UINT256

      if(parseFloat(ethAllowance) < parseFloat(amount)) {

        await erc20Contract.methods.approve(contract, amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })

        return true
      } else {
        return true
      }

    } catch(error) {
      console.log(error)
      if(error.message) {
        return false
      }
      return false
    }
  }

  _checkApproval = async (asset, account, amount, contract, callback) => {
    try {
      const config = await this._getConfig();
      const web3 = await this._getWeb3Provider()
      const erc20Contract = new web3.eth.Contract(config.erc20ABI, asset.erc20address)
      const allowance = await erc20Contract.methods.allowance(account.address, contract).call({ from: account.address })

      let ethAllowance = web3.utils.fromWei(allowance, "ether")
      if (asset.decimals !== 18) {
        ethAllowance = (allowance*10**asset.decimals).toFixed(0)
      }

      var amountToSend = MAX_UINT256

      if(parseFloat(ethAllowance) < parseFloat(amount)) {
        await erc20Contract.methods.approve(contract, amountToSend).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        callback()
      } else {
        callback()
      }

    } catch(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    }
  }

  configure = async () => {
    const account = store.getStore('account')

    if(!account || !account.address) {
      return false
    }

    const web3 = await this._getWeb3Provider()

    if (
      web3.currentProvider && 
      config.supportedNetworks.includes(web3.currentProvider.networkVersion)
    ) {
      emitter.emit(SNACKBAR_ERROR, "You are on an unsupported network. Please switch to Mainnet")
      return;
    }

    // add BUSD/USDC/USDT Pool to pool creation list if on 
    if (parseFloat(web3.currentProvider.networkVersion) === 56)
      this.store.basePools.push(
        {
          id: 'USD',
          name: 'BUSD/USDC/USDT Pool',
          erc20address: '0x1b3771a66ee31180906972580ade9b81afc5fcdc',
          balance: 0,
          decimals: 18,
          assets: [
            {
              index: 0,
              id: 'BUSD',
              name: 'Binance-Peg BUSD',
              symbol: 'BUSD',
              description: 'BUSD',
              erc20address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
              balance: 0,
              decimals: 18,
            },
            {
              index: 1,
              id: 'USDT',
              name: 'Binance-Peg USDT',
              symbol: 'USDT',
              description: 'USDT',
              erc20address: '0x55d398326f99059ff775485246999027b3197955',
              balance: 0,
              decimals: 18,
            },
            {
              index: 2,
              id: 'USDC',
              name: 'Binance-Peg USD',
              symbol: 'USDC',
              description: 'USD//C',
              erc20address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
              balance: 0,
              decimals: 6,
            },
          ]
        }
      )
    else 
      this.store.basePools.push(
        {
          id: 'USD',
          name: 'DAI/USDC/USDT Pool',
          erc20address: '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7',
          balance: 0,
          decimals: 18,
          assets: [
            {
              index: 0,
              id: 'DAI',
              name: 'DAI',
              symbol: 'DAI',
              description: 'DAI',
              erc20address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
              balance: 0,
              decimals: 18,
            },
            {
              index: 1,
              id: 'USDC',
              name: 'USD Coin',
              symbol: 'USDC',
              description: 'USD//C',
              erc20address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
              balance: 0,
              decimals: 6,
            },
            {
              index: 2,
              id: 'USDT',
              name: 'USDT',
              symbol: 'USDT',
              description: 'USDT',
              erc20address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
              balance: 0,
              decimals: 6,
            },
          ]
        }
      );

    const pools = await this._getPoolsV2(web3);

    async.map(pools, (pool, callback) => {
      this._getPoolData(web3, pool, account, callback)
    }, (err, poolData) => {
      if(err && err !== 1) {
        emitter.emit(ERROR, err)
        return emitter.emit(SNACKBAR_ERROR, err)
      }
      poolData = poolData.filter(p => p);
      store.setStore({ pools: poolData })
      return emitter.emit(CONFIGURE_RETURNED)
    })
  }

  changeSelectedPool = async (payload) => {

    try {

      const { pool } = payload.content

      // update url
      window.history.pushState({}, null, pool.address); 

      // get the underlying asset balances for the selected pool
      const underlyingBalances = await this._getUnderlyingBalances(pool);

      // update store values
      store.setStore({ selectedPool: pool})
      store.setStore({ underlyingBalances })

      // emit 
      emitter.emit(SELECTED_POOL_CHANGED)

    } catch (ex) {

      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)

    }

  }

  // get the config for the correct chain
  _getConfig = async () => {

      const web3 = await this._getWeb3Provider()

      const chainId = parseFloat(web3.currentProvider.networkVersion);
      const _config = config[chainId];

      // unsupported network
      if (!_config) return;

      return _config;

  }


  _getPoolsV2 = async (web3) => {
    try {

      const config = await this._getConfig();
      const chainId = parseFloat(web3.currentProvider.networkVersion);

      let pools;

      // get the factory contract
      const curveFactoryContract = new web3.eth.Contract(config.curveFactoryV2ABI, config.curveFactoryV2Address);

      if (chainId === 1) {

        const poolCount = await curveFactoryContract.methods.pool_count().call();

        pools = await Promise.all([...Array(parseInt(poolCount)).keys()].map(
          i => curveFactoryContract.methods.pool_list(i).call()
        ))

        return pools.map((poolAddress) => {
          return {
            version: 2,
            address: poolAddress
          }
        })


      } else if (chainId === 56) {

        const poolCount = await curveFactoryContract.methods.metaSwapPoolLength().call();

        pools = await Promise.all([...Array(parseInt(poolCount)).keys()].map(async (i) => {
          const poolData = (await curveFactoryContract.methods.metaSwapPoolInfo(i).call())
          return poolData;
        }))


        return pools.map((poolData) => {
          return {
            version: 2,
            address: poolData['metaSwapAddress'],
            liquidityAddress: poolData['metaSwapDepositAddress']
          }
        })

      }



    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _getUnderlyingBalances = async (pool) => {
    try {

      // get account and web3
      const web3 = await this._getWeb3Provider()
      // get config
      const config = await this._getConfig();
      // get chainId
      const chainId = parseFloat(web3.currentProvider.networkVersion);

      // initialize curve factory contract or swap contract
      const contract = new web3.eth.Contract(
        chainId === 1 ? config.curveFactoryV2ABI : config.metaSwapABI,
        chainId === 1 ? config.curveFactoryV2Address : pool.address
      );

      let balances;

      if (chainId === 1) {
        // get the underlying balances of each asset in the pool
        balances = await contract.methods.get_underlying_balances(pool.address).call()
        // only keep what's needed
        balances = balances.slice(0, pool.assets.length);
      } else if(chainId === 56) {
        // get the pool balances
        balances = await Promise.all([...new Array(2)].map(async (num, index) => {
          return await contract.methods.getTokenBalance(index).call();
        }));
      }

      return balances;

    } catch(ex) {
      emitter.emit(ERROR, ex)
      // emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  getPreselectedPool = async (payload) => {
    try {

      const { pools } = payload.content

      // get the path
      const path = window.location.pathname;

      // extract pool address
      const preSelectedPool = path.substring(path.lastIndexOf("/") + 1);

      let selectedPool = null;

      // check address validity
      if (pools && (/^0x[a-fA-F0-9]{40}$/).test(preSelectedPool))
        // look for pool that matches address in url
        for (const pool of pools) {
          if(pool.address.toUpperCase() === preSelectedPool.toUpperCase())
            selectedPool = pool;
        }
      
      // autofill to first pool if there isn't a preselected one
      if (selectedPool === null)
        selectedPool = pools && pools.length > 0 ? pools[0] : null

      // set store selected pool value
      store.setStore({ selectedPool: selectedPool })

      // navigate to swap if user visit site without swap/liquidity in url
      if (window.location.pathname.indexOf('swap') === -1 && window.location.pathname.indexOf('liquidity') === -1)
        // add pool address to url
        window.history.pushState({}, null, `swap/${selectedPool.address}`); 

      // get the underlying asset balances for the selected pool
      const underlyingBalances = await this._getUnderlyingBalances(selectedPool);

      store.setStore({ underlyingBalances })

      emitter.emit(PRESELECTED_POOL_RETURNED, selectedPool)

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  getBalances = async () => {
    const account = store.getStore('account')

    if(!account || !account.address) {
      return false
    }

    return emitter.emit(BALANCES_RETURNED)
  }

  // was memoized by prevented token balance from being updated after deposit/withdraw
  _getCoinData = async ({ web3, filteredCoins, coinAddress, accountAddress }) => {

    const config = await this._getConfig();
    const erc20Contract0 = new web3.eth.Contract(config.erc20ABI, coinAddress)

    const symbol0 = await erc20Contract0.methods.symbol().call()
    const decimals0 = parseInt(await erc20Contract0.methods.decimals().call())
    const name0 = await erc20Contract0.methods.name().call()

    let balance0 = await erc20Contract0.methods.balanceOf(accountAddress).call()
    const bnDecimals0 = new BigNumber(10)
      .pow(decimals0)

    balance0 = new BigNumber(balance0)
      .dividedBy(bnDecimals0)
      .toFixed(decimals0, BigNumber.ROUND_DOWN)

    return {
      index: filteredCoins.indexOf(coinAddress),
      erc20address: coinAddress,
      symbol: symbol0,
      decimals: decimals0,
      name: name0,
      balance: balance0
    }
  }

  _getPoolData = async (web3, pool, account, callback) => {
    try {

      const config = await this._getConfig();
      const chainId = parseFloat(web3.currentProvider.networkVersion);
      // list of pools to exclude
      const exclude = ["Curve.fi Factory USD Metapool: RC_WETH_1650_DAI_2021_4_30", "Curve.fi Factory USD Metapool: RC_WBTC_25000_2021_3_31"];
      const addrBlacklist = ["0x112001947E8a5D54016D20CAc4d84779Bc48e75C"];

      if (addrBlacklist.includes(pool.address)) return;

      if (chainId === 1) {

        const erc20Contract = new web3.eth.Contract(config.erc20ABI, pool.address)

        // only get RC_ & RR_ tokens, exclude RC_WBTC_25000_DAI_2021_3_31 (since it was for testing and only used for testing)
        const name = await erc20Contract.methods.name().call();
        if ((!name.includes('RC_') && !name.includes('RR_')) || exclude.indexOf(name) !== -1) return callback(null);
        const symbol = await erc20Contract.methods.symbol().call();
        const decimals = parseInt(await erc20Contract.methods.decimals().call())

        let balance = await erc20Contract.methods.balanceOf(account.address).call()
        const bnDecimals = new BigNumber(10)
          .pow(decimals)

        balance = new BigNumber(balance)
          .dividedBy(bnDecimals)
          .toFixed(decimals, BigNumber.ROUND_DOWN)

        const curveFactoryContract = new web3.eth.Contract(config.curveFactoryV2ABI, config.curveFactoryV2Address);
        const poolBalances = await curveFactoryContract.methods.get_balances(pool.address).call()
        const fee = await curveFactoryContract.methods.get_fees(pool.address).call()
        const a = await curveFactoryContract.methods.get_A(pool.address).call()
        const isPoolSeeded = sumArray(poolBalances) !== 0

        let coins = await curveFactoryContract.methods.get_underlying_coins(pool.address).call()

        let filteredCoins = coins.filter((coin) => {
          return coin !== ZERO_ADDRESS
        })

        async.map(filteredCoins, async (coin, callbackInner) => {
          try {
            const returnCoin = await this._getCoinData({
              web3,
              filteredCoins,
              coinAddress: coin,
              accountAddress: account.address,
            });

            if(callbackInner) {
              callbackInner(null, returnCoin)
            } else {
              return returnCoin
            }
          } catch(ex) {
            console.log(ex)

            if(callbackInner) {
              callbackInner(ex)
            } else {
              throw ex
            }
          }

        }, (err, assets) => {
          if(err) {
            emitter.emit(ERROR, err)
            return emitter.emit(SNACKBAR_ERROR, err)
          }

          let liquidityAddress = ''
          let liquidityABI = ''

          if(assets[1].erc20address.toLowerCase() === '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase()) {
            liquidityAddress = config.usdDepositerAddress
            liquidityABI = config.usdDepositerABI
          } else {
            liquidityAddress = config.btcDepositerAddress
            liquidityABI = config.btcDepositerABI
          }

          callback(null, {
            version: pool.version,
            address: pool.address,
            liquidityAddress: liquidityAddress,
            liquidityABI: liquidityABI,
            symbol: symbol,
            a,
            fee,
            decimals: parseFloat(decimals),
            name: name,
            balance: balance.toString(),
            isPoolSeeded,
            id: `${symbol}-${pool.version}`,
            chainId,
            assets: assets
          })
        })
      } else if (chainId === 56) {

        // metapool contract
        const swapContract = new web3.eth.Contract(config.metaSwapABI, pool.address)
        const liquidityContract = new web3.eth.Contract(config.metapoolABI, pool.liquidityAddress)

        // get pool data
        const data = await swapContract.methods.swapStorage().call();
        const a = (parseFloat(data.initialA) / 100).toString();
        const fee = {0: data.swapFee, 1: data.adminFee};
        const lpAddress = data.lpToken;

        // get lp token contract
        const lpContract = new web3.eth.Contract(config.erc20ABI, lpAddress);

        // token contract
        // const token0 = new web3.eth.Contract(config.erc20ABI, token0Address);
        const symbol = await lpContract.methods.symbol().call();
        const name = await lpContract.methods.name().call();
        if (!symbol.includes('RC_') && !symbol.includes('RR_')) return;

        const decimals = await lpContract.methods.decimals().call();
        const bnDecimals = new BigNumber(10)
          .pow(decimals)

        let balance = await lpContract.methods.balanceOf(account.address).call()
        balance = new BigNumber(balance)
          .dividedBy(bnDecimals)
          .toFixed(parseFloat(decimals), BigNumber.ROUND_DOWN)

        // get the pool balances
        const underlyingCoins = await Promise.all([...new Array(4)].map(async (num, index) => {
          return await liquidityContract.methods.tokens(index).call();
        }));

        // RC / LP token balances
        const poolBalances = await Promise.all([...new Array(2)].map(async (num, index) => {
          return await swapContract.methods.getTokenBalance(index).call();
        }));

        // is the pool seeded
        const isPoolSeeded = poolBalances.filter(val => val !== '0').length !== 0;

        // filter out zero addresses
        let filteredCoins = underlyingCoins.filter((coin) => {
          return coin !== ZERO_ADDRESS
        })

        async.map(filteredCoins, async (coin, callbackInner) => {
          try {
            const returnCoin = await this._getCoinData({
              web3,
              filteredCoins,
              coinAddress: coin,
              accountAddress: account.address,
            });

            if(callbackInner) {
              callbackInner(null, returnCoin)
            } else {
              return returnCoin
            }
          } catch(ex) {
            console.log(ex)

            if(callbackInner) {
              callbackInner(ex)
            } else {
              throw ex
            }
          }

        }, (err, assets) => {
          if(err) {
            emitter.emit(ERROR, err)
            return emitter.emit(SNACKBAR_ERROR, err)
          }

          const liquidityAddress = pool.liquidityAddress;
          const liquidityABI = config.metapoolABI;

          callback(1, {
            version: pool.version,
            address: pool.address,
            liquidityAddress: liquidityAddress,
            liquidityABI: liquidityABI,
            symbol: symbol,
            a,
            fee,
            decimals: parseFloat(decimals),
            name: name,
            balance: balance.toString(),
            isPoolSeeded,
            lpAddress,
            chainId,
            id: `${symbol}-${pool.version}`,
            assets: assets
          })
        })

      }
    } catch(ex) {
      console.log(ex)
      return callback(ex)
    }
  }

  deposit = async (payload) => {
    try {
      const { pool, amounts } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider()

      const amountsBN = amounts.map((amount, index) => {

        let amountToSend = web3.utils.toWei(amount, "ether")
        if (pool.assets[index].decimals !== 18) {
          const decimals = new BigNumber(10)
            .pow(pool.assets[index].decimals)

          amountToSend = new BigNumber(amount)
            .times(decimals)
            .toFixed(0)
        }

        return amountToSend
      })

      console.log(amountsBN)

      const approvals = await Promise.all(pool.assets.map(
        (asset, index) => { return this._checkApproval2(asset, account, amounts[index], pool.liquidityAddress) }
      ))

      console.log(approvals)

      this._callAddLiquidity(web3, account, pool, amountsBN, (err, a) => {
        if(err) {
          emitter.emit(ERROR, err)
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        emitter.emit(DEPOSIT_RETURNED)
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _getVirtualPrice = async(contract) => {

    const web3 = await this._getWeb3Provider();
    const chainId = parseFloat(web3.currentProvider.networkVersion);
    
    let virtualPrice = '';

    if (chainId === 1)
      virtualPrice = await contract.methods.get_virtual_price().call()
    else if (chainId === 56)
      virtualPrice = await contract.methods.getVirtualPrice().call()

    return virtualPrice;

  }

  _calcWithdrawOneCoin = async(account, pool, amountToSend, index) => {
    const web3 = await this._getWeb3Provider();
    const chainId = parseFloat(web3.currentProvider.networkVersion);
    const config = await this._getConfig();

    // initialize contract
    const contract = new web3.eth.Contract(
      chainId === 1 ? pool.liquidityABI : config.metapoolABI,
      pool.liquidityAddress
    )

    let amountToReceive = '';

    if (chainId === 1) {

      amountToReceive = await contract.methods.calc_withdraw_one_coin(pool.address, amountToSend, index).call();

    } else if (chainId === 56) {

      amountToReceive = await contract.methods.calculateRemoveLiquidityOneToken(account.address, amountToSend, index).call();

    }

    return amountToReceive;
  }

  _calcWithdrawAmount = async(address, pool, amountToSend, amountsBN, depositing) => {

    const web3 = await this._getWeb3Provider();
    const chainId = parseFloat(web3.currentProvider.networkVersion);
    const metapoolContract = new web3.eth.Contract(pool.liquidityABI, pool.liquidityAddress);

    let amounts = '';

    if (chainId === 1) {

      amounts = await metapoolContract.methods.calc_token_amount(pool.address, amountsBN, depositing).call()

    } else if (chainId === 56) {

      amounts = await metapoolContract.methods.calculateRemoveLiquidity(address, amountToSend).call()

    }

    return amounts;

  }

  _calcTokenAmount = async(address, pool, amounts, depositing) => {

    const web3 = await this._getWeb3Provider();
    const chainId = parseFloat(web3.currentProvider.networkVersion);
    const metapoolContract = new web3.eth.Contract(pool.liquidityABI, pool.liquidityAddress);
    
    let amountToReceive = '';

    if (chainId === 1) {

      amountToReceive = await metapoolContract.methods.calc_token_amount(pool.address, amounts, depositing).call()

    } else if (chainId === 56) {

      amountToReceive = await metapoolContract.methods.calculateTokenAmount(address, amounts, depositing).call()

    }

    return amountToReceive;

  }

  _getDyUnderlying = async (contract, from, to, amount) => {

    const web3 = await this._getWeb3Provider();
    const chainId = parseFloat(web3.currentProvider.networkVersion);
    
    let dyUnderlying= '';

    if (chainId === 1)
      dyUnderlying = await contract.methods.get_dy_underlying(from, to, amount).call()
    else if (chainId === 56)
      dyUnderlying = await contract.methods.calculateSwapUnderlying(from, to, amount).call()

    return dyUnderlying;

  }

  _callAddLiquidity = async (web3, account, pool, amounts, callback) => {

    const metapoolContract = new web3.eth.Contract(pool.liquidityABI, pool.liquidityAddress)
    const chainId = parseFloat(web3.currentProvider.networkVersion);

    
    let receive = '0'
    try {
      const amountToReceive = await this._calcTokenAmount(account.address, pool, amounts, true);
      receive = new BigNumber(amountToReceive)
        .times(95)
        .dividedBy(100)
        .toFixed(0)
    } catch(ex) {
      console.log(ex)
      // if we can't calculate, we need to check the totalSupply
      // if 0, we just set receive to 0
      // if not 0, we throw an exception because it shouldn't be.
      const balances = await this._getUnderlyingBalances(pool);
      const totalSupply = sumArray(balances);
      if(parseFloat(totalSupply) === 0) {
        receive = '0'
      } else {
        return callback(ex)
      }
    }

    if (chainId === 1) {
      metapoolContract.methods.add_liquidity(pool.address, amounts, receive).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 1) {
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
        }
      })
      .on('receipt', function(receipt){
        dispatcher.dispatch({ type: CONFIGURE, content: {} })
        emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      })
    } else if (chainId === 56) {
      // trade deadline
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      metapoolContract.methods.addLiquidity(amounts, receive, deadline).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 1) {
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
        }
      })
      .on('receipt', function(receipt){
        dispatcher.dispatch({ type: CONFIGURE, content: {} })
        emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      })
    }
  }

  withdraw = async (payload) => {
    try {
      const { pool, amount: _amount, amounts } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider()

      // const amount = (parseFloat(_amount) + (parseFloat(_amount) * 0.1)).toString();
      // console.log(amount);
      let amount = _amount;

      const amountsBN = amounts.map((amount, index) => {

        let amountToSend = web3.utils.toWei(amount, "ether")
        if (pool.assets[index].decimals !== 18) {
          const decimals = new BigNumber(10)
            .pow(pool.assets[index].decimals)

          amountToSend = new BigNumber(amount)
            .times(decimals)
            .toFixed(0)
        }

        return amountToSend
      })

      let amountToSend = web3.utils.toWei(amount, "ether")
      if (pool.decimals !== 18) {
        const decimals = new BigNumber(10)
          .pow(pool.decimals)

        amountToSend = new BigNumber(amount)
          .times(decimals)
          .toFixed(0)
      }

      if (pool.chainId === 1)
        await this._checkApproval2({erc20address:pool.address, decimals:18}, account, amountToSend, pool.liquidityAddress)
      else if (pool.chainId === 56)
        await this._checkApproval2({erc20address:pool.lpAddress, decimals:18}, account, amountToSend, pool.liquidityAddress)

      this._callRemoveLiquidity(web3, account, pool, amountToSend, amountsBN, (err, a) => {
        if(err) {
          emitter.emit(ERROR, err)
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        emitter.emit(WITHDRAW_RETURNED)
      })


    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _callRemoveLiquidity = async (web3, account, pool, amountToSend, amountsBN, callback) => {

    const config = await this._getConfig();
    const chainId = parseFloat(web3.currentProvider.networkVersion);

    // initialize contract
    const contract = new web3.eth.Contract(
      chainId === 1 ? pool.liquidityABI : config.metapoolABI,
      pool.liquidityAddress
    )

    // transaction deadline
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    let assets = 0;
    // determine if single sided removal or not
    for (const amount of amountsBN) {
      if (parseFloat(amount) !== 0)
        assets++;
    }

    if (assets === 1) {

      // get the index of the asset being removed
      const index = amountsBN.findIndex(asset => parseInt(asset) !== 0);

      // single sided removal      
      if (chainId === 1)
        await contract.methods.remove_liquidity_one_coin(pool.address, amountToSend, index, 0, account.address).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function(hash){
          emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
          callback(null, hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          console.log(confirmationNumber)
          if(confirmationNumber === 1) {
            // emitter.emit(SNACKBAR_TRANSACTION_CONFIRMED, receipt)
            dispatcher.dispatch({ type: CONFIGURE, content: {} })
          }
        })
        .on('receipt', function(receipt){
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
          emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
        })
        .on('error', function(error) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        })
      else if (chainId === 56)
        await contract.methods.removeLiquidityOneToken(amountToSend, index, 0, deadline).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function(hash){
          emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
          callback(null, hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          console.log(confirmationNumber)
          if(confirmationNumber === 1) {
            // emitter.emit(SNACKBAR_TRANSACTION_CONFIRMED, receipt)
            dispatcher.dispatch({ type: CONFIGURE, content: {} })
          }
        })
        .on('receipt', function(receipt){
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
          emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
        })
        .on('error', function(error) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        })
      

    } else if (assets > 1 && assets < amountsBN.length) {

      // imbalanced removal
      if (chainId === 1)
        await contract.methods.remove_liquidity_imbalance(pool.address, amountsBN, amountToSend, account.address).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function(hash){
          emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
          callback(null, hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          if(confirmationNumber === 1) {
            dispatcher.dispatch({ type: CONFIGURE, content: {} })
          }
        })
        .on('receipt', function(receipt){
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
          emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
        })
        .on('error', function(error) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        })
      else if (chainId === 56)
        await contract.methods.removeLiquidityImbalance(amountsBN, amountToSend, deadline).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function(hash){
          emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
          callback(null, hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          if(confirmationNumber === 1) {
            dispatcher.dispatch({ type: CONFIGURE, content: {} })
          }
        })
        .on('receipt', function(receipt){
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
          emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
        })
        .on('error', function(error) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        })

    } else {

      // remove all
      if (chainId === 1)
        await contract.methods.remove_liquidity(pool.address, amountToSend, [0, 0, 0, 0]).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function(hash){
          emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
          callback(null, hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          if(confirmationNumber === 1) {
            dispatcher.dispatch({ type: CONFIGURE, content: {} })
          }
        })
        .on('receipt', function(receipt){
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
          emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
        })
        .on('error', function(error) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        })
      else if (chainId === 56)
        await contract.methods.removeLiquidity(amountToSend, [0, 0, 0, 0], deadline).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
        .on('transactionHash', function(hash){
          emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
          callback(null, hash)
        })
        .on('confirmation', function(confirmationNumber, receipt){
          if(confirmationNumber === 1) {
            dispatcher.dispatch({ type: CONFIGURE, content: {} })
          }
        })
        .on('receipt', function(receipt){
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
          emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
        })
        .on('error', function(error) {
          if(error.message) {
            return callback(error.message)
          }
          callback(error)
        })

    }

  }

  getSwapAmount = async (payload) => {
    try {
      const { pool, from, to, amount } = payload.content
      const web3 = await this._getWeb3Provider()
      const config = await this._getConfig();
      const chainId = parseFloat(web3.currentProvider.networkVersion);

      if (from.erc20address === to.erc20address){
        emitter.emit(SNACKBAR_ERROR, `You can't swap the same assets (${from.name} to ${to.name})`)
        return;
      }

      let amountToSend = web3.utils.toWei(amount, "ether")
      if (from.decimals !== 18) {
        const decimals = new BigNumber(10)
          .pow(from.decimals)

        amountToSend = new BigNumber(amount)
          .times(decimals)
          .toFixed(0)
      }

      const metapoolContract = new web3.eth.Contract(
        chainId === 1 ? config.metapoolABI : config.metaSwapABI, 
        pool.address
      )

      const amountToReceive = await this._getDyUnderlying(metapoolContract, from.index, to.index, amountToSend);

      const receiveAmount = amountToReceive/10**to.decimals
      const slippage = (parseFloat(receiveAmount) - parseFloat(amount)) / 
                        ((parseFloat(receiveAmount) + parseFloat(amount))/2);

      const returnObj = {
        sendAmount: amount,
        receiveAmount,
        receivePerSend: receiveAmount / amount,
        sendPerReceive: amount / receiveAmount,
      }

      emitter.emit(SLIPPAGE_INFO_RETURNED, {
        slippagePcent: typeof slippage !== 'undefined' ? slippage * 100 : slippage,
      })
      emitter.emit(SWAP_AMOUNT_RETURNED, returnObj)
    } catch(ex) {
      console.log(ex)
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  swap = async (payload) => {
    try {
      const { from, to, pool, amount } = payload.content
      const account = store.getStore('account')
      const config = await this._getConfig();
      const web3 = await this._getWeb3Provider()
      const chainId = parseFloat(web3.currentProvider.networkVersion);

      this._checkApproval(from, account, amount, pool.address, async (err) => {
        if(err) {
          emitter.emit(ERROR, err)
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        let amountToSend = web3.utils.toWei(amount, "ether")
        if (from.decimals !== 18) {
          const decimals = new BigNumber(10)
            .pow(from.decimals)

          amountToSend = new BigNumber(amount)
            .times(decimals)
            .toFixed(0)
        }

        const metapoolContract = new web3.eth.Contract(
          chainId === 1 ? config.metapoolABI : config.metaSwapABI, 
          pool.address
        )

        const amountToReceive = await this._getDyUnderlying(metapoolContract, from.index, to.index, amountToSend);

        this._callExchange(web3, account, from, to, pool, amountToSend, amountToReceive, (err, a) => {
          if(err) {
            emitter.emit(ERROR, err)
            return emitter.emit(SNACKBAR_ERROR, err)
          }

          emitter.emit(SWAP_RETURNED)
        })

      })
    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _callExchange = async (web3, account, from, to, pool, amountToSend, amountToReceive, callback) => {
    const config = await this._getConfig();
    const chainId = parseFloat(web3.currentProvider.networkVersion);

    const receive = new BigNumber(amountToReceive)
      .times(95)
      .dividedBy(100)
      .toFixed(0)

    const metapoolContract = new web3.eth.Contract(
      chainId === 1 ? config.metapoolABI : config.metaSwapABI, 
      pool.address
    )

    if (chainId === 1) { 
      metapoolContract.methods.exchange_underlying(from.index, to.index, amountToSend, receive).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 1) {
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
        }
      })
      .on('receipt', function(receipt){
        dispatcher.dispatch({ type: CONFIGURE, content: {} })
        emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      })
    } else if (chainId === 56) {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      metapoolContract.methods.swapUnderlying(from.index, to.index, amountToSend, receive, deadline).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 1) {
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
        }
      })
      .on('receipt', function(receipt){
        dispatcher.dispatch({ type: CONFIGURE, content: {} })
        emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      })

    }
  }

  getAssetInfo = async (payload) => {
    try {
      const { address } = payload.content
      const config = await this._getConfig();
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider()

      const erc20Contract = new web3.eth.Contract(config.erc20ABI, address)

      const symbol = await erc20Contract.methods.symbol().call()
      const decimals = parseInt(await erc20Contract.methods.decimals().call())
      const name = await erc20Contract.methods.name().call()

      let balance = await erc20Contract.methods.balanceOf(account.address).call()
      const bnDecimals = new BigNumber(10)
        .pow(decimals)

      balance = new BigNumber(balance)
        .dividedBy(bnDecimals)
        .toFixed(decimals, BigNumber.ROUND_DOWN)

      const returnObj = {
        address: address,
        symbol: symbol,
        decimals: decimals,
        name: name,
        balance: balance
      }

      emitter.emit(GET_ASSET_INFO_RETURNED, returnObj)
    } catch(ex) {
      console.log(ex)
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  addPool = async (payload) => {
    try {
      const { basePool, address,  name, symbol, a, fee } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider()

      this._callDeployMetapool(web3, account, basePool, address, name, symbol, a, fee, (err, a) => {
        if(err) {
          emitter.emit(ERROR, err)
          return emitter.emit(SNACKBAR_ERROR, err)
        }

        emitter.emit(ADD_POOL_RETURNED)
      })

    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _callDeployMetapool = async (web3, account, basePool, address, name, symbol, a, fee, callback) => {
    const config = await this._getConfig();
    const chainId = parseFloat(web3.currentProvider.networkVersion);
    const deployContract= new web3.eth.Contract(config.curveFactoryV2ABI, config.curveFactoryV2Address)

    if (chainId === 1) {
      deployContract.methods.deploy_metapool(basePool.erc20address, name, symbol, address, a, fee).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 1) {
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
        }
      })
      .on('receipt', function(receipt){
        dispatcher.dispatch({ type: CONFIGURE, content: {} })
        emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      })
    } else if (chainId === 56) {
      const contract = await new web3.eth.Contract(config.erc20ABI, address);
      const decimals = await contract.methods.decimals().call();
      const data = [
        [address, '0xf2511b5e4fb0e5e2d123004b672ba14850478c14'],
        [decimals, '18'],
        name, 
        symbol, 
        a, 
        fee,
        fee,
        '0',
        '0',
        basePool.erc20address
      ];
      console.log(data);
      deployContract.methods.deploy(
        [address, '0xf2511b5e4fb0e5e2d123004b672ba14850478c14'],
        [decimals,'18'],
        name, 
        symbol, 
        a, 
        fee,
        fee,
        '0',
        '0',
        basePool.erc20address, 
      ).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
      .on('transactionHash', function(hash){
        emitter.emit(SNACKBAR_TRANSACTION_HASH, hash)
        callback(null, hash)
      })
      .on('confirmation', function(confirmationNumber, receipt){
        if(confirmationNumber === 1) {
          dispatcher.dispatch({ type: CONFIGURE, content: {} })
        }
      })
      .on('receipt', function(receipt){
        dispatcher.dispatch({ type: CONFIGURE, content: {} })
        emitter.emit(SNACKBAR_TRANSACTION_RECEIPT, receipt.transactionHash)
      })
      .on('error', function(error) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      })
    }
  }

  getWithdrawAmount = async (payload) => {
    try {
      const { pool, amounts, poolAmount, account, assets, index } = payload.content
      const web3 = await this._getWeb3Provider()
      const config = await this._getConfig();
      const chainId = parseFloat(web3.currentProvider.networkVersion);

      // convert amounts array into BN amounts array
      const amountsBN = amounts.map((amount, index) => {
        let amountToSend = web3.utils.toWei(amount, "ether")
        if (pool.assets[index].decimals !== 18) {
          const decimals = new BigNumber(10)
            .pow(pool.assets[index].decimals)

          amountToSend = new BigNumber(amount)
            .times(decimals)
            .toFixed(0)
        }

        return amountToSend
      })

      const poolContract = new web3.eth.Contract(
        chainId === 1 ? config.metapoolABI : config.metaSwapABI, 
        pool.address
      )

      // get the index of the asset being removed
      // const index = amountsBN.findIndex(asset => parseInt(asset) !== 0);
      // if (index === -1 && chainId === 1) return;

      // get amount to send and get the direction (recipient) of the amount received 
      let amountToSend = poolAmount && !isNaN(poolAmount) ? web3.utils.toWei(poolAmount, "ether") : ''
      const direction = amountToSend === '' ? 'pool' : 'assets'

      // update amountToSend to be the single asset typed in
      if (assets === 1 && pool.chainId === 1)
        amountToSend = web3.utils.toWei(amounts[index], "ether")

      if (amountToSend === '') return;

      let receiveAmountBn, virtPriceBn
      let decimals = 18

      // const x = await this._calcTokenAmount(account.address, pool, amountsBN, false);
      if (assets > 1) { 
        [receiveAmountBn, virtPriceBn] = await Promise.all([
          this._calcWithdrawAmount(account.address, pool, amountToSend, amountsBN, false),
          this._getVirtualPrice(poolContract)
        ])
      } else if(assets === 1 && amountToSend){ 
        [receiveAmountBn, virtPriceBn] = await Promise.all([
          this._calcWithdrawOneCoin(account, pool, amountToSend, index),
          this._getVirtualPrice(poolContract)
        ])
        // update decimals for receive amount calculation
        decimals = pool.assets[index].decimals;
      }

      const receiveAmount = bnToFixed(receiveAmountBn, decimals)
      const virtPrice = bnToFixed(virtPriceBn, 18)
      let slippage;

      let receiveAmounts, realValue, virtualValue;

      // nrv pools return an array of how much of each asset will be returned
      if (Array.isArray(receiveAmountBn)) {
        const receiveBN = await this._calcTokenAmount(account.address, pool, amountsBN, false);
        receiveAmounts = receiveAmountBn.map((amount,index) => bnToFixed(amount, pool.assets[index].decimals));
        realValue = sumArray(receiveAmounts);
        virtualValue = parseFloat(virtPrice) * parseFloat(bnToFixed(receiveBN, 18));
      } else {
        // Assuming each component is at peg
        realValue = sumArray(amounts) === 0 ? parseFloat(poolAmount) : sumArray(amounts);
        virtualValue = parseFloat(virtPrice) * parseFloat(receiveAmount);
      }


      slippage = (virtualValue / realValue) - 1;

      emitter.emit(GET_WITHDRAW_AMOUNT_RETURNED, {withdrawAmount: receiveAmount, direction, slippage, receiveAmounts})

      emitter.emit(SLIPPAGE_INFO_RETURNED, {
        slippagePcent: typeof slippage !== 'undefined' ? slippage * 100 : slippage,
      })
    } catch(ex) {
      console.log(ex)
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  getDepositAmount = async (payload) => {
    try {
      const { pool, amounts, account } = payload.content
      const web3 = await this._getWeb3Provider()
      const config = await this._getConfig();
      const chainId = parseFloat(web3.currentProvider.networkVersion);

      const amountsBN = amounts.map((amount, index) => {
        let amountToSend = web3.utils.toWei(amount, "ether")
        if (pool.assets[index].decimals !== 18) {
          const decimals = new BigNumber(10)
            .pow(pool.assets[index].decimals)

          amountToSend = new BigNumber(amount)
            .times(decimals)
            .toFixed(0)
        }

        return amountToSend
      })

      const poolContract = new web3.eth.Contract(
        chainId === 1 ? config.metapoolABI : config.metaSwapABI, 
        pool.address
      )

      let receiveAmountBn, virtPriceBn;

      if (chainId === 1) {
        [receiveAmountBn, virtPriceBn] = await Promise.all([
          // zapContract.methods.calc_token_amount(pool.address, amountsBN, true).call(),
          this._calcTokenAmount(account.address, pool, amountsBN, true),
          poolContract.methods.get_virtual_price().call(),
        ])
      } else if (chainId === 56) {
        [receiveAmountBn, virtPriceBn] = await Promise.all([
          this._calcTokenAmount(account.address, pool, amountsBN, true),
          poolContract.methods.getVirtualPrice().call(),
        ])
      }
      

      const receiveAmount = bnToFixed(receiveAmountBn, 18)
      let slippage;

      if (Number(receiveAmount)) {
        const virtualValue = multiplyBnToFixed(virtPriceBn, receiveAmountBn, 18)
        const realValue = sumArray(amounts) // Assuming each component is at peg

        slippage = (virtualValue / realValue) - 1;
      }

      emitter.emit(GET_DEPOSIT_AMOUNT_RETURNED, parseFloat(receiveAmount))
      emitter.emit(SLIPPAGE_INFO_RETURNED, {
        slippagePcent: typeof slippage !== 'undefined' ? slippage * 100 : slippage,
      })
    } catch(ex) {
      console.log(ex)
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _getGasPrice = async () => {
    try {
      const url = 'https://gasprice.poa.network/'
      const priceString = await rp(url)
      const priceJSON = JSON.parse(priceString)
      if(priceJSON) {
        return priceJSON.fast.toFixed(0)
      }
      return store.getStore('universalGasPrice')
    } catch(e) {
      console.log(e)
      return store.getStore('universalGasPrice')
    }
  }

  _getWeb3Provider = async () => {
    const web3context = store.getStore('web3context')

    if(!web3context) {
      return null
    }
    const provider = web3context.library.provider
    if(!provider) {
      return null
    }

    const web3 = new Web3(provider)

    return web3
  }
}

var store = new Store()

export default {
  store: store,
  dispatcher: dispatcher,
  emitter: emitter
}
