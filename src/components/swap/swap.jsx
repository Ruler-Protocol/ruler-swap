import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import {
  Typography,
  TextField,
  MenuItem,
  Button,
} from '@material-ui/core';
import SwapVertIcon from '@material-ui/icons/SwapVert';
import { colors } from '../../theme'

import Loader from '../loader'
import RateInfo from '../rateInfo'
import UnderlyingAssetsInfo from './underlyingAssetsInfo'
import PoolSeedingCTA from '../poolSeedingCTA'
import { floatToFixed } from '../../utils/numbers'

import {
  ERROR,
  GET_BALANCES,
  BALANCES_RETURNED,
  CONFIGURE_RETURNED,
  GET_SWAP_AMOUNT,
  SWAP_AMOUNT_RETURNED,
  SWAP,
  SWAP_RETURNED,
} from '../../constants'

import Store from "../../stores";
const emitter = Store.emitter
const dispatcher = Store.dispatcher
const store = Store.store

const styles = theme => ({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px',
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  inputContainer: {
    display: 'flex',
    padding: '30px',
    borderRadius: '10px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    margin: '40px 0px',
    border: '1px solid '+colors.pink,
    minWidth: '600px',
    background: colors.white
  },
  inputCardHeading: {
    width: '100%',
    color: colors.darkGray,
    paddingLeft: '12px'
  },
  valContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: '24px'
  },
  balances: {
    textAlign: 'right',
    paddingRight: '20px',
    cursor: 'pointer'
  },
  assetSelectMenu: {
    padding: '15px 15px 15px 20px',
    minWidth: '300px',
    display: 'flex'
  },
  assetSelectIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    borderRadius: '10px',
    background: '#dedede',
    height: '30px',
    width: '30px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  assetSelectIconName: {
    paddingLeft: '10px',
    display: 'inline-block',
    verticalAlign: 'middle',
    flex: 1
  },
  assetSelectBalance: {
    paddingLeft: '24px'
  },
  assetAdornment: {
    color: colors.text + ' !important'
  },
  assetContainer: {
    minWidth: 'auto'
  },
  assetSelectRoot: {
    '& .MuiInput-input': {
      justifyContent: 'flex-end',
      overflow: 'visible',
      flex: 1
    },
    '& input': {
      flex: 1
    }
  },
  actionButton: {
    '&:hover': {
      backgroundColor: colors.pink,
      border: `1px solid ${colors.pink}`,
    },
    marginTop: '24px',
    padding: '12px',
    backgroundColor: colors.darkPink,
    borderRadius: '10px',
    border: `1px solid ${colors.darkPink}`,
    fontWeight: 500,
    [theme.breakpoints.up('md')]: {
      padding: '15px',
    }
  },
  buttonText: {
    fontWeight: '700',
    color: 'white',
  },
  priceContainer: {
    display: 'flex',
    justifyContent: 'space-evenly',
    width: '100%',
    background: '#dedede',
    borderRadius: '10px',
    padding: '24px'
  },
  priceHeading: {
    paddingBottom: '12px'
  },
  priceConversion: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  conversionDirection: {
    color: colors.darkGray
  },
  toggleContainer: {
    width: '100%',
    display: 'flex',
  },
  toggleHeading: {
    flex: 1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '24px',
    color: colors.darkGray
  },
  toggleHeadingActive: {
    flex: 1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '24px',
    color: colors.text
  },
  flexy: {
    width: '100%',
    display: 'flex'
  },
  label: {
    flex: 1,
    paddingLeft: '12px'
  },
  between: {
    width: '24px'
  },
  portfolioContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '40px'
  },
  titleBalance: {
    padding: '20px 10px',
    borderRadius: '10px',
    border: '1px solid '+colors.pink,
    background: colors.white,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  inline: {
    display: 'flex',
    alignItems: 'baseline'
  },
  symbol: {
    paddingLeft: '6px'
  },
  gray: {
    color: colors.darkGray
  },
  version1: {
    border: '1px solid '+colors.pink,
    padding: '6px',
    width: 'fit-content',
    borderRadius: '10px',
    background: 'rgba(25, 101, 233, 0.5)',
    fontSize: '12px'
  },
  version2: {
    border: '1px solid '+colors.pink,
    padding: '6px',
    width: 'fit-content',
    borderRadius: '10px',
    background: 'rgba(25, 101, 233, 0.5)',
    fontSize: '12px'
  },
  poolSelectOption: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  swapIconContainer: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    marginBottom: '12px'
  },
  swapIcon: {
    cursor: 'pointer'
  }
});

class Swap extends Component {

  constructor(props) {
    super()

    const account = store.getStore('account')
    const pools = store.getStore('pools')
    const selectedPool = this.handleSelectedPool(pools);

    this.state = {
      pools: pools,
      pool: selectedPool ? selectedPool.id : '',
      selectedPool: selectedPool,
      fromAsset: selectedPool && selectedPool.assets.length > 0 ? selectedPool.assets[0].symbol : '',
      toAsset: selectedPool && selectedPool.assets.length > 0 ? selectedPool.assets[1].symbol : '',
      account: account,
      fromAmount: '',
      fromAmountError: false,
      toAmount: '',
      receivePerSend: '',
      sendPerReceive: '',
      loading: !(pools && pools.length > 0 && pools[0].assets.length > 0),
      calculatedSwapAmount: null,
    }

    if(account && account.address) {
      dispatcher.dispatch({ type: GET_BALANCES, content: {} })
    }
  }
  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(BALANCES_RETURNED, this.balancesReturned);
    emitter.on(CONFIGURE_RETURNED, this.configureReturned);
    emitter.on(SWAP_AMOUNT_RETURNED, this.swapAmountReturned);
    emitter.on(SWAP_RETURNED, this.swapReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(BALANCES_RETURNED, this.balancesReturned);
    emitter.removeListener(CONFIGURE_RETURNED, this.configureReturned);
    emitter.removeListener(SWAP_AMOUNT_RETURNED, this.swapAmountReturned);
    emitter.removeListener(SWAP_RETURNED, this.swapReturned);
  };

  // set the selected pool if there is a pool address in the URL
  handleSelectedPool = (pools) => {

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

    return selectedPool;
  }

  configureReturned = () => {
    const pools = store.getStore('pools')

    const selectedPool = this.handleSelectedPool(pools);

    this.setState({
      account: store.getStore('account'),
      pools: pools,
      pool: selectedPool ? selectedPool.id : '',
      selectedPool: selectedPool,
      fromAsset: selectedPool && selectedPool.assets.length > 0 ? selectedPool.assets[0].symbol : '',
      toAsset: selectedPool && selectedPool.assets.length > 0 ? selectedPool.assets[1].symbol : '',
      loading: false
    })

    // dispatcher.dispatch({ type: GET_BALANCES, content: {} })
  };

  connectionDisconnected = () => {
    this.setState({ account: store.getStore('account') })
  }

  balancesReturned = (balances) => {
    const pools = store.getStore('pools')
    const selectedPool = pools && pools.length > 0 ? pools[0] : null

    this.setState({
      pools: pools,
      pool: selectedPool ? selectedPool.id : '',
      selectedPool: selectedPool,
      fromAsset: selectedPool && selectedPool.assets.length > 0 ? selectedPool.assets[0].symbol : '',
      toAsset: selectedPool && selectedPool.assets.length > 0 ? selectedPool.assets[1].symbol : '',
    })
  };

  swapAmountReturned = (amount) => {
    if(amount.sendAmount === this.state.fromAmount) {
      this.setState({
        calculatedSwapAmount: amount,
        toAmount: amount.receiveAmount,
        receivePerSend: amount.receivePerSend,
        sendPerReceive: amount.sendPerReceive,
      })
    }
  }

  swapReturned = () => {
    this.setState({
      loading: false,
      fromAmount: '',
      toAmount: '',
      receivePerSend: '',
      sendPerReceive: '',
    })
  }

  errorReturned = (error) => {
    this.setState({ loading: false })
  };

  swapAssets = () => {
    let val = []
    val['fromAsset'] = this.state.toAsset
    val['toAsset'] = this.state.fromAsset
    this.setState(val)

    const that = this

    window.setTimeout(() => {
      that._getSwapAmount()
    }, 100)
  }

  render() {
    const { classes } = this.props;
    const {
      loading,
      account,
      fromAsset,
      toAsset,
      fromAmount,
      receivePerSend,
      sendPerReceive,
      selectedPool,
    } = this.state

    if(!account || !account.address) {
      return (<div></div>)
    }

    return (
      <div className={ classes.root }>
        <div className={ classes.inputContainer }>
          { this.renderPoolSelect() }
          {(selectedPool && !selectedPool.isPoolSeeded) &&
            <PoolSeedingCTA pool={selectedPool} />}
          {(!selectedPool || selectedPool.isPoolSeeded) && (
            <Fragment>
              { this.renderAssetInput('from') }
              <div className={ classes.swapIconContainer }>
                <SwapVertIcon className={ classes.swapIcon } onClick={ this.swapAssets }/>
              </div>
              { this.renderAssetInput('to') }
              <RateInfo
                fromAsset={fromAsset}
                toAsset={toAsset}
                receivePerSend={receivePerSend}
                sendPerReceive={sendPerReceive}
              />
              <Button
                className={ classes.actionButton }
                variant="outlined"
                color="primary"
                disabled={ loading || fromAmount === '' }
                onClick={ this.onSwap }
                fullWidth
                >
                <Typography className={ classes.buttonText } variant={ 'h4'} color='secondary'>{ ( fromAmount === '') && 'enter from amount' }{ (fromAmount !== '') && 'swap' }</Typography>
              </Button>
            </Fragment>
          )}
        </div>
        { loading && <Loader /> }
      </div>
    )
  };

  renderPoolSelect = () => {
    const { loading, pools, pool, selectedPool } = this.state
    const { classes } = this.props

    return (
      <div className={ classes.valContainer }>
        <div className={ classes.flexy }>
          <div className={ classes.label }>
            <Typography variant='h4'>pool</Typography>
          </div>
          <div className={ classes.balances }>
          </div>
        </div>
        <div>
          <TextField
            id={ 'pool' }
            name={ 'pool' }
            select
            value={ pool }
            onChange={ this.onPoolSelectChange }
            SelectProps={{
              native: false,
              renderValue: (option) => {
                return (
                  <div className={ classes.assetSelectIconName }>
                    <Typography variant='h4'>{ option }</Typography>
                  </div>
                )
              }
            }}
            fullWidth
            variant="outlined"
            disabled={ loading }
            className={ classes.actionInput }
            placeholder={ 'Select' }
          >
            { pools ? pools.map((pool) => { return this.renderPoolOption(pool) }) : null }
          </TextField>
        </div>
        <UnderlyingAssetsInfo selectedPool={selectedPool} />
      </div>
    )
  }

  renderPoolOption = (option) => {
    const { classes } = this.props

    return (
      <MenuItem key={option.id} value={option.id} className={ classes.assetSelectMenu }>
        <div className={ classes.poolSelectOption }>
          <Typography variant='h4'>{ option.name }</Typography>
          <Typography variant='h5' className={`${ option.version === 1 ? classes.version1 : classes.version2 }`}>version { option.version }</Typography>
        </div>
      </MenuItem>
    )
  }

  renderAssetInput = (type) => {
    const {
      classes
    } = this.props

    const {
      loading,
      selectedPool
    } = this.state

    const that = this

    let asset = null

    if(selectedPool && selectedPool.assets) {
      asset = selectedPool.assets.filter((asset) => { return asset.symbol === that.state[type+"Asset"] })
      if(asset.length > 0) {
        asset = asset[0]
      } else {
        asset = null
      }
    }

    const amount = this.state[type+"Amount"]
    const amountError = this.state[type+'AmountError']

    return (
      <div className={ classes.valContainer }>
        <div className={ classes.flexy }>
          <div className={ classes.label }>
            <Typography variant='h4'>{ type }</Typography>
          </div>
          <div className={ classes.balances }>
            { (asset ? (<Typography variant='h4' onClick={ () => { this.setAmount(asset.symbol, type, (asset ? floatToFixed(asset.balance, asset.decimals) : '0')) } } className={ classes.value } noWrap>{ 'Balance: '+ ( asset && asset.balance ? floatToFixed(asset.balance, 4) : '0.0000') } { asset ? asset.symbol : '' }</Typography>) : <Typography variant='h4' className={ classes.value } noWrap>Balance: -</Typography>) }
          </div>
        </div>
        <div>
          <TextField
            fullWidth
            disabled={ loading || type === "to" }
            className={ classes.actionInput }
            id={ type+"Amount" }
            value={ amount }
            error={ amountError }
            onChange={ this.onChange }
            placeholder="0.00"
            variant="outlined"
            type="number"
            InputProps={{
              endAdornment: <div className={ classes.assetContainer }>{ this.renderAssetSelect(type+"Asset") }</div>,
            }}
          />
        </div>
      </div>
    )
  }

  renderAssetSelect = (id) => {
    const { loading, selectedPool } = this.state
    const { classes } = this.props

    return (
      <TextField
        id={ id }
        name={ id }
        select
        value={ this.state[id] }
        onChange={ this.onAssetSelectChange }
        SelectProps={{
          native: false,
        }}
        fullWidth
        disabled={ loading }
        placeholder={ 'Select' }
        className={ classes.assetSelectRoot }
      >
        { selectedPool && selectedPool.assets ? selectedPool.assets.map(this.renderAssetOption) : null }
      </TextField>
    )
  }

  renderAssetOption = (option) => {
    const { classes } = this.props

    return (
      <MenuItem key={option.symbol} value={option.symbol} className={ classes.assetSelectMenu }>
        <React.Fragment>
          <div className={ classes.assetSelectIcon }>
            <img
              alt=""
              src={ this.getLogoForAsset(option) }
              height="30px"
            />
          </div>
          <div className={ classes.assetSelectIconName }>
            <Typography variant='h4'>{ option.symbol }</Typography>
          </div>
        </React.Fragment>
      </MenuItem>
    )
  }

  getLogoForAsset = (asset) => {
    try {
      return require('../../assets/tokens/'+asset.symbol+'-logo.png')
    } catch {
      return require('../../assets/tokens/unknown-logo.png')
    }
  }

  startLoading = () => {
    this.setState({ loading: true })
  }

  onChange = (event) => {
    let val = []
    val[event.target.id] = event.target.value
    this.setState(val)

    const that = this

    window.setTimeout(() => {
      that._getSwapAmount()
    }, 100)
  }

  onPoolSelectChange = (event) => {
    let val = []
    val[event.target.name] = event.target.value
    this.setState(val)

    const selectedPool = this.state.pools.find((pool) => {
      return pool.id === event.target.value
    })

    //on change pool change assets as well
    this.setState({
      fromAsset: selectedPool.assets[0].symbol,
      toAsset: selectedPool.assets[1].symbol,
      selectedPool,
      toAmount: '',
      receivePerSend: '',
      sendPerReceive: '',
    })

    const that = this

    window.setTimeout(() => {
      that._getSwapAmount()
    }, 100)
  }

  onAssetSelectChange = (event) => {
    let val = []
    val[event.target.name] = event.target.value
    this.setState(val)
    const that = this

    window.setTimeout(() => {
      that._getSwapAmount()
    }, 100)
  }

  setAmount = (id, type, balance) => {
    if(type === 'to') {
      return false
    }
    let val = []
    val[type+"Amount"] = balance
    this.setState(val)
    const that = this

    window.setTimeout(() => {
      that._getSwapAmount()
    }, 100)
  }

  _getSwapAmount = () => {
    const {
      fromAsset,
      toAsset,
      selectedPool,
      fromAmount
    } = this.state

    if (!selectedPool.isPoolSeeded) return

    const from = selectedPool.assets.filter((asset) => {
      return asset.symbol === fromAsset
    })[0]

    const to = selectedPool.assets.filter((asset) => {
      return asset.symbol === toAsset
    })[0]

    if(fromAmount === '' || fromAmount === '0') {
      this.setState({
        toAmount: '',
        receivePerSend: '',
        sendPerReceive: '',
      })
      return
    }

    if(!fromAmount || isNaN(fromAmount) || fromAmount <= 0) {
      return false
    }

    dispatcher.dispatch({ type: GET_SWAP_AMOUNT, content: { pool: selectedPool, from: from, to: to, amount: fromAmount } })
  }

  onSwap = () => {
    this.setState({ fromAmountError: false })

    const {
      fromAsset,
      toAsset,
      selectedPool,
      fromAmount
    } = this.state

    const from = selectedPool.assets.filter((asset) => {
      return asset.symbol === fromAsset
    })[0]

    const to = selectedPool.assets.filter((asset) => {
      return asset.symbol === toAsset
    })[0]

    if(!fromAmount || isNaN(fromAmount) || fromAmount <= 0 || fromAmount > from.balance) {
      this.setState({ fromAmountError: true })
      return false
    }

    this.setState({ loading: true })
    dispatcher.dispatch({ type: SWAP, content: { pool: selectedPool, from: from, to: to, amount: fromAmount } })
  }
}

export default withRouter(withStyles(styles)(Swap));
