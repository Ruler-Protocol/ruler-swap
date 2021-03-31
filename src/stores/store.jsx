import config from '../config'
import async from 'async'
import memoize from 'memoizee'
import BigNumber from 'bignumber.js'
import { bnToFixed, multiplyBnToFixed, sumArray } from '../utils/numbers'

import {
  MAX_UINT256,
  ZERO_ADDRESS,

  SNACKBAR_ERROR,
  SNACKBAR_TRANSACTION_HASH,
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
  SELECTED_POOL_CHANGED
  
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
      basePools: [
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
        },
      ],
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
    const pools = (await this._getPoolsV2(web3)) || [];

    async.map(pools, (pool, callback) => {
      this._getPoolData(web3, pool, account, callback)
    }, (err, poolData) => {
      if(err) {
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

  _getPoolsV2 = async (web3) => {
    try {
      const curveFactoryContract = new web3.eth.Contract(config.curveFactoryV2ABI, config.curveFactoryV2Address)

      const poolCount = await curveFactoryContract.methods.pool_count().call()

      const pools = await Promise.all([...Array(parseInt(poolCount)).keys()].map(
        i => curveFactoryContract.methods.pool_list(i).call()
      ))

      return pools.map((poolAddress) => {
        return {
          version: 2,
          address: poolAddress
        }
      })
    } catch (ex) {
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }
  }

  _getUnderlyingBalances = async (pool) => {
    try {

      // get account and web3
      const web3 = await this._getWeb3Provider()

      // initialize curve factory contract
      const curveFactoryContract = new web3.eth.Contract(config.curveFactoryV2ABI, config.curveFactoryV2Address)

      // get the underlying balances of each asset in the pool
      const balances = await curveFactoryContract.methods.get_underlying_balances(pool.address).call()

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

      // add pool address to url
      window.history.pushState({}, null, selectedPool.address); 

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

  _getCoinData = memoize(async ({ web3, filteredCoins, coinAddress, accountAddress }) => {
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
  }, {
    promise: true,
    normalizer: ([{ coinAddress, accountAddress }]) => `${coinAddress}-${accountAddress}`,
  })

  _getPoolData = async (web3, pool, account, callback) => {
    try {
      const erc20Contract = new web3.eth.Contract(config.erc20ABI, pool.address)

      // only get RC_ & RR_ tokens, exclude RC_WBTC_25000_DAI_2021_3_31 (since it was for testing and only used for testing)
      const name = await erc20Contract.methods.name().call();
      if ((!name.includes('RC_') && !name.includes('RR_')) || name.includes(`RC_WBTC_25000_2021_3_31`)) return callback(null);
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
          decimals: decimals,
          name: name,
          balance: balance.toString(),
          isPoolSeeded,
          id: `${symbol}-${pool.version}`,
          assets: assets
        })
      })
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

      const approvals = await Promise.all(pool.assets.map(
        (asset, index) => { return this._checkApproval2(asset, account, amounts[index], pool.liquidityAddress) }
      ))

      console.log(approvals)

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

  _callAddLiquidity = async (web3, account, pool, amounts, callback) => {
    const metapoolContract = new web3.eth.Contract(pool.liquidityABI, pool.liquidityAddress)

    console.log(pool.liquidityAddress)
    let receive = '0'
    try {
      const amountToReceive = await metapoolContract.methods.calc_token_amount(pool.address, amounts, true).call()
      receive = new BigNumber(amountToReceive)
        .times(95)
        .dividedBy(100)
        .toFixed(0)
    } catch(ex) {
      console.log(ex)
      //if we can't calculate, we need to check the totalSupply
      // if 0, we just set receive to 0
      // if not 0, we throw an exception because it shouldn't be.
      const tokenContract = new web3.eth.Contract(config.erc20ABI, pool.address)
      const totalSupply = await tokenContract.methods.totalSupply().call()
      console.log(totalSupply)
      if(totalSupply === 0) {
        receive = '0'
      } else {
        return callback(ex)
      }
    }

    console.log(receive);

    metapoolContract.methods.add_liquidity(pool.address, amounts, 0, account.address).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
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
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  _getBurnAmount = async (pool, amounts) => {
    try {
      const web3 = await this._getWeb3Provider();

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

      // get the index of the asset being removed
      const zapContract = new web3.eth.Contract(pool.liquidityABI, pool.liquidityAddress);

      const receiveAmountBn = await zapContract.methods.calc_token_amount(pool.address, amountsBN, false).call();
      const receiveAmount = bnToFixed(receiveAmountBn, 18);

      return (receiveAmount);

    } catch(ex) {
      console.log(ex)
      emitter.emit(ERROR, ex)
      emitter.emit(SNACKBAR_ERROR, ex)
    }

  }

  withdraw = async (payload) => {
    try {
      const { pool, amount: _amount, amounts } = payload.content
      const account = store.getStore('account')
      const web3 = await this._getWeb3Provider()

      // const amount = (parseFloat(_amount) + (parseFloat(_amount) * 0.01)).toString();
      // console.log(amount);
      // const amount = await this._getBurnAmount(pool, amounts);
      const amount = _amount;


      let amountToSend = web3.utils.toWei(amount, "ether")
      if (pool.decimals !== 18) {
        const decimals = new BigNumber(10)
          .pow(pool.decimals)

        amountToSend = new BigNumber(amount)
          .times(decimals)
          .toFixed(0)
      }

      await this._checkApproval2({erc20address:pool.address, decimals:18}, account, amountToSend, pool.liquidityAddress)

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
    const zapContract = new web3.eth.Contract(pool.liquidityABI, pool.liquidityAddress)

    //calcualte minimum amounts ?

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
      await zapContract.methods.remove_liquidity_one_coin(pool.address, amountToSend, index, 0, account.address).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
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
      })
      .on('error', function(error) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      })

    } else if (assets > 1 && assets < amountsBN.length) {

      // imbalanced removal
      await zapContract.methods.remove_liquidity_imbalance(pool.address, amountsBN, amountToSend, account.address).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
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
      })
      .on('error', function(error) {
        if(error.message) {
          return callback(error.message)
        }
        callback(error)
      })

    } else {

      // remove all
      await zapContract.methods.remove_liquidity(pool.address, amountToSend, [0, 0, 0, 0]).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
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

      let amountToSend = web3.utils.toWei(amount, "ether")
      if (from.decimals !== 18) {
        const decimals = new BigNumber(10)
          .pow(from.decimals)

        amountToSend = new BigNumber(amount)
          .times(decimals)
          .toFixed(0)
      }

      const metapoolContract = new web3.eth.Contract(config.metapoolABI, pool.address)
      const amountToReceive = await metapoolContract.methods.get_dy_underlying(from.index, to.index, amountToSend).call()

      const receiveAmount = amountToReceive/10**to.decimals

      const returnObj = {
        sendAmount: amount,
        receiveAmount,
        receivePerSend: receiveAmount / amount,
        sendPerReceive: amount / receiveAmount,
      }

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
      const web3 = await this._getWeb3Provider()

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

        const metapoolContract = new web3.eth.Contract(config.metapoolABI, pool.address)
        const amountToReceive = await metapoolContract.methods.get_dy_underlying(from.index, to.index, amountToSend).call()

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
    const metapoolContract = new web3.eth.Contract(config.metapoolABI, pool.address)

    const receive = new BigNumber(amountToReceive)
      .times(95)
      .dividedBy(100)
      .toFixed(0)

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
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  getAssetInfo = async (payload) => {
    try {
      const { address } = payload.content
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
    const curveFactoryContract = new web3.eth.Contract(config.curveFactoryV2ABI, config.curveFactoryV2Address)

    curveFactoryContract.methods.deploy_metapool(basePool.erc20address, name, symbol, address, a, fee).send({ from: account.address, gasPrice: web3.utils.toWei(await this._getGasPrice(), 'gwei') })
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
    })
    .on('error', function(error) {
      if(error.message) {
        return callback(error.message)
      }
      callback(error)
    })
  }

  getWithdrawAmount = async (payload) => {
    try {
      const { pool, amounts } = payload.content
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

      // get the index of the asset being removed
      const zapContract = new web3.eth.Contract(pool.liquidityABI, pool.liquidityAddress)
      const poolContract = new web3.eth.Contract(config.metapoolABI, pool.address)

      const [receiveAmountBn, virtPriceBn] = await Promise.all([
        zapContract.methods.calc_token_amount(pool.address, amountsBN, false).call(),
        poolContract.methods.get_virtual_price().call(),
      ])

      const receiveAmount = bnToFixed(receiveAmountBn, 18)
      let slippage;

      console.log(receiveAmount);

      if (Number(receiveAmount)) {
        const virtualValue = multiplyBnToFixed(virtPriceBn, receiveAmountBn, 18)
        const realValue = sumArray(amounts) // Assuming each component is at peg

        slippage = (virtualValue / realValue) - 1;
      }


      // emitter.emit(GET_DEPOSIT_AMOUNT_RETURNED, parseFloat(receiveAmount))
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
      const { pool, amounts } = payload.content
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

      const zapContract = new web3.eth.Contract(pool.liquidityABI, pool.liquidityAddress)
      const poolContract = new web3.eth.Contract(config.metapoolABI, pool.address)

      const [receiveAmountBn, virtPriceBn] = await Promise.all([
        zapContract.methods.calc_token_amount(pool.address, amountsBN, true).call(),
        poolContract.methods.get_virtual_price().call(),
      ])

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
