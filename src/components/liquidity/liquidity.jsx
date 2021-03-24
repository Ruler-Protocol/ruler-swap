import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import PoolSeedingCTA from '../poolSeedingCTA'
import {
  Typography,
  TextField,
  MenuItem,
  Button,
} from '@material-ui/core';
import { colors } from '../../theme'

import Loader from '../loader'
import SlippageInfo from '../slippageInfo'
import CurrencyReserves from '../currencyReserves'
import { floatToFixed } from '../../utils/numbers'

import {
  ERROR,
  CONFIGURE_RETURNED,
  BALANCES_RETURNED,
  DEPOSIT,
  DEPOSIT_RETURNED,
  WITHDRAW,
  WITHDRAW_RETURNED,
  GET_DEPOSIT_AMOUNT,
  GET_DEPOSIT_AMOUNT_RETURNED,
  GET_WITHDRAW_AMOUNT_RETURNED,
  SLIPPAGE_INFO_RETURNED,
  CHANGE_SELECTED_POOL,
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
    maxWidth: '1200px',
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
    minWidth: '650px',
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
    display: 'flex',
    width: '100%'
  },
  assetSelectIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    borderRadius: '10px',
    background: '#dedede',
    height: '30px',
    width: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    marginRight: '12px'
  },
  assetSelectIconName: {
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
    minWidth: '120px'
  },
  actionButton: {
    '&:hover': {
      backgroundColor: colors.green,
    },
    '&:disabled': {
      backgroundColor: colors.disabled
    },
    marginTop: '24px',
    padding: '12px',
    backgroundColor: colors.compoundGreen,
    borderRadius: '10px',
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
    textDecoration: 'underline',
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
  space: {
    height: '24px'
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
    width: '100%',
    minWidth: '300px',
    padding: '12px 12px'
  },
  gray: {
    color: colors.darkGray
  },
});

class Liquidity extends Component {

  constructor(props) {
    super()

    const account = store.getStore('account')
    const pools = store.getStore('pools')

    const selectedPool = store.getStore('selectedPool'); 

    this.state = {
      account: account,
      pools: pools,
      pool: selectedPool ? selectedPool.id : '',
      selectedPool: selectedPool,
      poolAmount: '',
      poolAmountError: '',
      loading: !(pools && pools.length > 0 && pools[0].assets.length > 0),
      activeTab: 'deposit',
      ...this.getStateSliceUserBalancesForSelectedPool(selectedPool),
    }

    // if(account && account.address) {
      // dispatcher.dispatch({ type: GET_BALANCES, content: {} })
    // }
  }
  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(CONFIGURE_RETURNED, this.configureReturned);
    emitter.on(DEPOSIT_RETURNED, this.depositReturned);
    emitter.on(WITHDRAW_RETURNED, this.withdrawReturned);
    emitter.on(GET_DEPOSIT_AMOUNT_RETURNED, this.getDepositAmountReturned);
    emitter.on(GET_WITHDRAW_AMOUNT_RETURNED, this.getWithdrawAmountReturned);
    emitter.on(SLIPPAGE_INFO_RETURNED, this.slippageInfoReturned);
    emitter.on(BALANCES_RETURNED, this.balancesReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(BALANCES_RETURNED, this.balancesReturned);
    emitter.removeListener(CONFIGURE_RETURNED, this.configureReturned);
    emitter.removeListener(DEPOSIT_RETURNED, this.depositReturned);
    emitter.removeListener(WITHDRAW_RETURNED, this.withdrawReturned);
    emitter.removeListener(GET_DEPOSIT_AMOUNT_RETURNED, this.getDepositAmountReturned);
    emitter.removeListener(GET_WITHDRAW_AMOUNT_RETURNED, this.getWithdrawAmountReturned);
    emitter.removeListener(SLIPPAGE_INFO_RETURNED, this.slippageInfoReturned);
  };

  configureReturned = () => {
    const pools = store.getStore('pools')

    const selectedPool = store.getStore('selectedPool'); 

    const newStateSlice = {
      account: store.getStore('account'),
      pools: pools,
      pool: selectedPool ? selectedPool.id : '',
      selectedPool,
      loading: false,
      ...this.getStateSliceUserBalancesForSelectedPool(selectedPool),
    };

    this.setState(newStateSlice);

    if (!selectedPool) return;

    this.getDepositAmount(newStateSlice);
  };

  // Returns hash map of user balances for selected pool, e.g. { BACAmount: '2.00', USDTAmount: '3.00', … }
  getStateSliceUserBalancesForSelectedPool = (selectedPool) => {
    if (!selectedPool) return {}

    return Object.assign({}, ...selectedPool.assets.map(({ symbol, balance, decimals }) => ({
      // [`${symbol}Amount`]: floatToFixed(balance, decimals)
      [`${symbol}Amount`]: ''
    })))
  }

  getDepositAmount = (newStateSlice = {}) => {
    const futureState = {
      ...this.state,
      ...newStateSlice,
    };

    const { selectedPool } = futureState;
    if (!selectedPool) return;

    this.setState({
      depositAmount: '',
    });

    if (!selectedPool.isPoolSeeded) return;

    const amounts = selectedPool.assets
      .map(({ symbol }) => futureState[`${symbol}Amount`]) // Gather balances for that pool from state
      .map((amount) => (amount === '' || isNaN(amount)) ? '0' : amount) // Sanitize

    dispatcher.dispatch({ type: GET_DEPOSIT_AMOUNT, content: { pool: selectedPool, amounts }})
  }

  getDepositAmountReturned = (val) => {
    this.setState({ depositAmount: val })
  }

  getWithdrawAmountReturned = (vals) => {
    this.setState({ withdrawAmounts: vals })
  }

  balancesReturned = (balances) => {
    const pools = store.getStore('pools')
    const pool = store.getStore('selectedPool')

    this.setState({
      pools,
      pool
    });
  };

  slippageInfoReturned = ({ slippagePcent }) => {
    this.setState({ slippagePcent })
  }

  depositReturned = () => {
    this.setState({ loading: false })
  }

  withdrawReturned = () => {
    this.setState({ loading: false })
  }

  errorReturned = (error) => {
    this.setState({ loading: false })
  };

  render() {
    const { classes } = this.props;
    const {
      loading,
      account,
      activeTab,
    } = this.state

    if(!account || !account.address) {
      return (<div></div>)
    }

    return (
      <div className={ classes.root }>
        <div className={ classes.inputContainer }>
          <div className={ classes.toggleContainer }>
            <Typography variant='h3' className={ activeTab === 'deposit' ? classes.toggleHeadingActive : classes.toggleHeading } onClick={ () => { this.toggleDeposit() }}>Deposit</Typography>
            <Typography variant='h3' className={ activeTab === 'withdraw' ? classes.toggleHeadingActive : classes.toggleHeading } onClick={ () => { this.toggleWithdraw() }}>Withdraw</Typography>
          </div>
          {
            activeTab === 'deposit' && this.renderDeposit()
          }
          {
            activeTab === 'withdraw' && this.renderWithdraw()
          }
        </div>
        <CurrencyReserves/>
        { loading && <Loader /> }
      </div>
    )
  };

  renderPoolSelectInput = () => {
    const {
      classes
    } = this.props

    const {
      loading,
      poolAmount,
      poolAmountError,
      selectedPool
    } = this.state

    return (
      <div className={ classes.valContainer }>
        <div className={ classes.flexy }>
          <div className={ classes.label }>
            <Typography variant='h4'>pool</Typography>
          </div>
          <div className={ classes.balances }>
            { (selectedPool ? (<Typography variant='h4' onClick={ () => { this.setAmount('pool', (selectedPool ? floatToFixed(selectedPool.balance, selectedPool.decimals) : '0')) } } className={ classes.value } noWrap>{ ''+ ( selectedPool && selectedPool.balance ? floatToFixed(selectedPool.balance, 4) : '0.0000') } { selectedPool ? selectedPool.id : '' }</Typography>) : <Typography variant='h4' className={ classes.value } noWrap>Balance: -</Typography>) }
          </div>
        </div>
        <div>
          <TextField
            fullWidth
            disabled={ loading }
            className={ classes.actionInput }
            id={ 'poolAmount' }
            value={ poolAmount }
            error={ poolAmountError }
            onChange={ this.onChange }
            placeholder="0.00"
            variant="outlined"
            InputProps={{
              endAdornment: <div className={ classes.assetContainer }>{ this.renderPoolSelectAsset("pool") }</div>,
            }}
          />
        </div>
      </div>
    )
  }

  renderPoolSelectAsset = (id) => {
    const { loading, pools } = this.state
    const { classes } = this.props

    return (
      <TextField
        id={ id }
        name={ id }
        select
        value={ this.state[id] }
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
        disabled={ loading }
        placeholder={ 'Select' }
        className={ classes.assetSelectRoot }
      >
        { pools ? pools.map(this.renderPoolSelectAssetOptions) : null }
      </TextField>
    )
  }

  renderPoolSelectAssetOptions = (option) => {
    const { classes } = this.props

    return (
      <MenuItem key={option.id} value={option.id} className={ classes.poolSelectOption }>
        <div>
          <Typography variant='h4'>{ option.name }</Typography>
          { option.balance > 0 ? <Typography variant='h5' className={ classes.gray }>Bal: { option.balance ? parseFloat(option.balance).toFixed(4) : '' }</Typography> : '' }
        </div>
        <Typography variant='h5' className={`${ option.version === 1 ? classes.version1 : classes.version2 }`}>version { option.version }</Typography>
      </MenuItem>
    )
  }

  renderPoolSelect = (id) => {
    const { loading, pools, pool } = this.state
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
            { pools ? pools.filter((pool) => { return pool.version === 2; }).map((pool) => { return this.renderPoolOption(pool) }) : null }
          </TextField>
        </div>
      </div>
    )
  }

  renderPoolOption = (option) => {
    const { classes } = this.props

    return (
      <MenuItem key={option.id} value={option.id} className={ classes.assetSelectMenu }>
        <React.Fragment>
          <div className={ classes.poolSelectOption }>
            <div className={ classes.assetSelectIcon }>
              <img
                alt=""
                src={ this.getLogoForAsset(option) }
                height="30px"
              />
            </div>
            <div className={ classes.assetSelectIconName }>
              <Typography variant='h4'>{ option.name }</Typography>
              <Typography variant='h5' className={`${ option.version === 1 ? classes.version1 : classes.version2 }`}>version { option.version }</Typography>
            </div>
          </div>
        </React.Fragment>
      </MenuItem>
    )
  }

  renderDeposit = () => {
    const { classes } = this.props;
    const {
      loading,
      selectedPool,
      depositAmount
    } = this.state

    let insufficientBalance = false;

    // check if user has input more than their token balance
    if (selectedPool)
      for (const asset of selectedPool.assets)
        if (this.state[asset.symbol + "AmountError"] === true) insufficientBalance = true

    // button disabled conditions
    const disabled = !depositAmount || 
                      depositAmount === '' || 
                      parseInt(depositAmount) === 0 ||
                      loading ||
                      insufficientBalance 

    return (
      <React.Fragment>
        { this.renderPoolSelect('deposit') }
        {(selectedPool && !selectedPool.isPoolSeeded) &&
          <PoolSeedingCTA pool={selectedPool} isDepositForm />}
        <div className={ classes.space }></div>
        {
          selectedPool && selectedPool.assets && selectedPool.assets.length > 0 && selectedPool.assets.map((p) => {
            return this.renderAssetInput(p, 'deposit')
          })
        }
        { selectedPool && selectedPool.assets && <div className={ classes.space }></div> }
        { selectedPool && selectedPool.assets && this.renderDepositAmount() }
        <Button
          className={ classes.actionButton }
          variant="outlined"
          color="primary"
          disabled={ disabled }
          onClick={ this.onDeposit }
          fullWidth
          >
          <Typography className={ classes.buttonText } variant={ 'h4'} color='secondary'>{ 'Deposit' }</Typography>
        </Button>
      </React.Fragment>
    )
  }

  renderDepositAmount = () => {
    const { classes } = this.props

    const {
      depositAmount,
      slippagePcent,
      selectedPool
    } = this.state;
    if (selectedPool && !selectedPool.isPoolSeeded) return null;

    return (
      <div className={ classes.valContainer }>
        <div className={ classes.flexy }>
          <div className={ classes.label }>
            <Typography variant='h4'>
              Receive
            </Typography>
          </div>
          <div className={ classes.balances }>
          </div>
        </div>
        <div>
          <TextField
            fullWidth
            disabled={ true }
            className={ classes.actionInput }
            id={ "depositAmount" }
            value={ depositAmount }
            placeholder="0.00"
            variant="outlined"
            type="number"
            InputProps={{
              startAdornment: <div className={ classes.assetSelectIcon }>
                <img
                  alt=""
                  src={ this.getLogoForAsset(selectedPool) }
                  height="30px"
                />
              </div>,
              endAdornment: <Typography variant='h5' style={{ width: 'auto', textAlign: 'right', whiteSpace: 'nowrap' }}>{selectedPool ? selectedPool.symbol : ''}</Typography>
            }}
          />
        </div>
        <SlippageInfo slippagePcent={slippagePcent} />
      </div>
    )
  }

  renderWithdraw = () => {
    const { classes } = this.props;
    const { loading, poolAmount } = this.state;

    // button disabled conditions
    const disabled = !poolAmount || 
                      poolAmount === '' || 
                      parseInt(poolAmount) === 0 ||
                      loading;

    return (
      <React.Fragment>
        { this.renderPoolSelectInput() }
        <Button
          className={ classes.actionButton }
          variant="outlined"
          color="primary"
          disabled={ disabled }
          onClick={ this.onWithdraw }
          fullWidth
          >
          <Typography className={ classes.buttonText } variant={ 'h4'} color='secondary'>{ 'Withdraw' }</Typography>
        </Button>
      </React.Fragment>
    )
  }

  startLoading = () => {
    this.setState({ loading: true })
  }

  renderAssetInput = (asset, DorW) => {
    const { classes } = this.props;
    const { loading } = this.state;

    let type = asset.symbol;

    const amount = this.state[type+"Amount"]

    // error input if user inputs more than their balance
    const amountError = this.state[type+"AmountError"] 

    return (
      <div className={ classes.valContainer }>
        <div className={ classes.flexy }>
          <div className={ classes.label }>
            <Typography variant='h4'>
              { asset.name }
            </Typography>
          </div>
          <div className={ classes.balances }>
            { (asset ? (<Typography variant='h4' onClick={ () => { if(DorW === 'withdraw') { return false; } this.setAmount(type, (asset ? floatToFixed(asset.balance, asset.decimals) : '0')) } } className={ classes.value } noWrap>{ ''+ ( asset && asset.balance ? floatToFixed(asset.balance, 4) : '0.0000') } { asset ? asset.symbol : '' }</Typography>) : <Typography variant='h4' className={ classes.value } noWrap>Balance: -</Typography>) }
          </div>
        </div>
        <div>
          <TextField
            fullWidth
            disabled={ (loading || DorW === 'withdraw') && !amountError }
            className={ classes.actionInput }
            id={ type+"Amount" }
            value={ amount }
            error={ amountError }
            onChange={ this.onChange }
            placeholder="0.00"
            variant="outlined"
            type="number"
            InputProps={{
              startAdornment: <div className={ classes.assetSelectIcon }>
                <img
                  alt={type}
                  src={ this.getLogoForAsset(asset) }
                  height="30px"
                />
              </div>,
            }}
          />
        </div>
      </div>
    )
  }

  getLogoForAsset = (asset) => {
    try {
      return require('../../assets/tokens/'+asset.symbol+'-logo.png')
    } catch {
      return require('../../assets/tokens/unknown-logo.png')
    }
  }

  onPoolSelectChange = (event) => {
    const selectedPool = this.state.pools.find((pool) => {
      return pool.id === event.target.value
    })

    const newStateSlice = {
      [event.target.name]: event.target.value,
      selectedPool,
      ...this.getStateSliceUserBalancesForSelectedPool(selectedPool),
    };

    this.setState(newStateSlice);
    this.getDepositAmount(newStateSlice);

    // notify that pool has changed
    dispatcher.dispatch({ type: CHANGE_SELECTED_POOL, content: { pool: selectedPool } })

    // If an url fragment was used to auto-select a pool, remove that
    // fragment when we change pool to revert to the naked /liquidity url.
    if (this.props.history.location.hash !== '') {
      this.props.history.replace('/liquidity');
    }
  }

  // determine if user has sufficient balance 
  determineSufficientBalance = (symbol, balance) => {

    // get the corresponding asset input
    const inputAsset = this.state.selectedPool.assets.filter((asset) => {
      return asset.symbol === symbol 
    })[0];

    // update state
    if (inputAsset)
      this.setState({
        [`${symbol}AmountError`]: parseFloat(inputAsset.balance) < parseFloat(balance)
      });

  }

  onChange = (event) => {

    // update state with new value and error boolean
    const newStateSlice = {
      [event.target.id]: event.target.value,
    }

    // get the asset symbol
    const symbol = event.target.id.substring(0,event.target.id.indexOf("Amount"))
    this.determineSufficientBalance(symbol, event.target.value);

    this.setState(newStateSlice);
    this.getDepositAmount(newStateSlice);
  }

  setAmount = (symbol, balance) => {
    const newStateSlice = {
      [`${symbol}Amount`]: balance,
    };

    this.determineSufficientBalance(symbol, balance);

    this.setState(newStateSlice);
    this.getDepositAmount(newStateSlice);
  }

  toggleDeposit = () => {
    if(this.state.loading) return;

    this.setState({ activeTab: 'deposit', poolAmount: '', depositAmount: ''});

    let { selectedPool } = this.state;

    if(!selectedPool) return false;

    const val = []
    // val[selectedPool.assets[0].symbol+'Amount'] = floatToFixed(selectedPool.assets[0].balance, selectedPool.assets[0].decimals)
    // val[selectedPool.assets[1].symbol+'Amount'] = floatToFixed(selectedPool.assets[1].balance, selectedPool.assets[1].decimals)
    val[selectedPool.assets[0].symbol+'Amount'] = '0';
    val[selectedPool.assets[1].symbol+'Amount'] = '0';
    this.setState(val)
  }

  toggleWithdraw = () => {
    if(this.state.loading) {
      return
    }

    this.setState({ activeTab: 'withdraw', poolAmount: '' })

    let {
      pools,
      pool,
      selectedPool
    } = this.state

    if(!pools) {
      return
    }

    if(!selectedPool) {
      selectedPool = pools[0]
      pool = pools[0].id

      this.setState({
        selectedPool: selectedPool,
        pool: pool
      })
    }

    const val = []
    val[selectedPool.assets[0].symbol+'Amount'] = ''
    val[selectedPool.assets[1].symbol+'Amount'] = ''
    this.setState(val)

  }

  onDeposit = () => {
    const { selectedPool } = this.state;

    let error = false

    let amounts = []

    for(let i = 0; i < selectedPool.assets.length; i++) {
      if (this.state[selectedPool.assets[i].symbol+'Amount'] === '')
        amounts.push('0')
      else
        amounts.push(this.state[selectedPool.assets[i].symbol+'Amount'])
    }

    if(!error) {
      this.setState({ loading: true })
      dispatcher.dispatch({ type: DEPOSIT, content: { pool: selectedPool, amounts: amounts } })
    }
  }

  onWithdraw = () => {
    this.setState({ poolAmountError: false })

    const { poolAmount, selectedPool } = this.state;

    if(!poolAmount || isNaN(poolAmount) || poolAmount <= 0 || poolAmount > selectedPool.balance) {
      this.setState({ poolAmountError: true })
      return false;
    }

    this.setState({ loading: true })
    dispatcher.dispatch({ type: WITHDRAW, content: { amount: poolAmount, pool: selectedPool } })
  }
}

export default withRouter(withStyles(styles)(Liquidity));
