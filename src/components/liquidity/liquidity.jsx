import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import PoolSeedingCTA from '../poolSeedingCTA'
import { Alert } from '@material-ui/lab'
import {
  Typography,
  TextField,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel
} from '@material-ui/core';
import { colors, darkTheme } from '../../theme'

import Loader from '../loader'
import SlippageInfo from '../slippageInfo'
import CurrencyReserves from '../currencyReserves'
import { floatToFixed, sumArray } from '../../utils/numbers'

import {
  ERROR,
  CONFIGURE_RETURNED,
  BALANCES_RETURNED,
  DEPOSIT,
  DEPOSIT_RETURNED,
  WITHDRAW,
  WITHDRAW_RETURNED,
  GET_WITHDRAW_AMOUNT,
  GET_WITHDRAW_AMOUNT_RETURNED,
  GET_DEPOSIT_AMOUNT,
  GET_DEPOSIT_AMOUNT_RETURNED,
  SLIPPAGE_INFO_RETURNED,
  CHANGE_SELECTED_POOL,
  SELECTED_POOL_CHANGED,
  PRESELECTED_POOL_RETURNED
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
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  alert: {
    width: '100%',
    margin: '5px 0'
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
    marginBottom: '40px'
  },
  balances: {
    textAlign: 'right',
    paddingRight: '20px',
    cursor: 'pointer',
  },
  actionINput: {
    marginTop: '10px'
  },
  depositAmount: {
    color: colors.text,
    width: 'auto',
    textAlign: 'right',
    whiteSpace: 'nowrap'
  },
  assetSelectMenu: {
    padding: '15px 15px 15px 20px',
    minWidth: '300px',
    display: 'flex',
    transition: 'all ease 0.5s',
    '&.darker': {
      background: colors.gray
    },
    '&:hover': {
      paddingLeft: '25px',
      background: colors.secondaryGray
    }
  },
  flexyStretch: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  assetLogo: {
    marginRight: '8px'
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
    display: 'flex',
    alignItems: 'center'
  },
  underPool: {
    marginTop: '3px',
    marginBottom: '10px'
  },
  label: {
    flex: 1,
    paddingLeft: '12px',
    display: 'flex',
    alignItems: 'flex-end'
  },
  showExpired: {
    flex: 1,
    paddingLeft: '12px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    maxHeight: '20px',
    '& svg': {
      transform: 'translateY(-1px)'
    },
    '& span': {
      padding: '0',
      marginLeft: '2px',
    },
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
    maxWidth: '650px',
    background: colors.white
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
  expired: {
    border: '1px solid '+colors.red,
    padding: '6px',
    width: 'fit-content',
    borderRadius: '10px',
    background: colors.red,
    color: 'white',
    fontSize: '12px'
  },
  poolSelectOption: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '8px 0 '
  },
  gray: {
    color: colors.darkGray
  },
  ...darkTheme 
});

class Liquidity extends Component {

  constructor(props) {
    super()

    const account = store.getStore('account');
    const pools = store.getStore('pools');
    const underlyingBalances = store.getStore('underlyingBalances');
    const selectedPool = store.getStore('selectedPool'); 

    this.state = {
      account: account,
      pools: pools,
      pool: selectedPool ? selectedPool.id : '',
      selectedPool: selectedPool,
      underlyingBalances,
      poolAmount: '',
      withdrawAsset: selectedPool? selectedPool.assets.map(asset => asset.symbol) : [],
      poolAmountError: false,
      loading: !(pools && pools.length > 0 && pools[0].assets.length > 0),
      showExpired: false,
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
    emitter.on(SLIPPAGE_INFO_RETURNED, this.slippageInfoReturned);
    emitter.on(BALANCES_RETURNED, this.balancesReturned);
    emitter.on(PRESELECTED_POOL_RETURNED, this.preselectedPoolReturned);
    emitter.on(SELECTED_POOL_CHANGED, this.selectedPoolChanged);
    emitter.on(GET_WITHDRAW_AMOUNT_RETURNED, this.getWithdrawAmountReturned)
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(BALANCES_RETURNED, this.balancesReturned);
    emitter.removeListener(CONFIGURE_RETURNED, this.configureReturned);
    emitter.removeListener(DEPOSIT_RETURNED, this.depositReturned);
    emitter.removeListener(WITHDRAW_RETURNED, this.withdrawReturned);
    emitter.removeListener(GET_DEPOSIT_AMOUNT_RETURNED, this.getDepositAmountReturned);
    emitter.removeListener(SLIPPAGE_INFO_RETURNED, this.slippageInfoReturned);
    emitter.removeListener(PRESELECTED_POOL_RETURNED, this.preselectedPoolReturned);
    emitter.removeListener(SELECTED_POOL_CHANGED, this.selectedPoolChanged);
    emitter.removeListener(GET_WITHDRAW_AMOUNT_RETURNED, this.getWithdrawAmountReturned)
  };

  selectedPoolChanged = () => {

    const selectedPool = store.getStore('selectedPool'); 

    this.setState({
      withdrawAsset: selectedPool? selectedPool.assets.map(asset => asset.symbol) : [],
    });

  }

  configureReturned = () => {

    const pools = store.getStore('pools')
    const selectedPool = store.getStore('selectedPool')

    const newStateSlice = {
      account: store.getStore('account'),
      pools: pools,
      pool: selectedPool ? selectedPool.id : '',
      withdrawAsset: selectedPool ? selectedPool.assets.map(asset => asset.symbol) : [],
      selectedPool,
      loading: false,
      ...this.getStateSliceUserBalancesForSelectedPool(selectedPool),
    };

    this.setState(newStateSlice);

    if (!selectedPool) return;

    this.getDepositAmount(newStateSlice);
  };

  formatAssetBalance = (balance, decimals) => {
    // get index for decimal
    const index = balance.length - decimals;

    // add decimal
    let formattedBalance = parseFloat(balance.substring(0, index) + '.' + balance.substring(index));

    // truncate 
    formattedBalance = floatToFixed(formattedBalance, decimals) 

    // return with commas 
    return(formattedBalance);
  }

  preselectedPoolReturned = (pool) => {
    // update pools and underlying balance
    this.setState({
        selectedPool: pool,
        underlyingBalances: store.getStore('underlyingBalances'),
        loading: false
    });

  }

  // Returns hash map of user balances for selected pool, e.g. { BACAmount: '2.00', USDTAmount: '3.00', … }
  getStateSliceUserBalancesForSelectedPool = (selectedPool) => {
    if (!selectedPool) return {}

    const amounts = Object.assign({}, ...selectedPool.assets.map(({ symbol, balance, decimals }) => ({
      [`${symbol}Amount`]: ''
    })))

    this.setState(amounts);

  }

  getWithdrawAmount = (newStateSlice = {}) => {

    const { selectedPool, underlyingBalances, activeTab } = this.state
    const { poolAmount } = newStateSlice;

    if (!selectedPool || activeTab !== 'withdraw') return;

    let withdrawAsset;

    if (newStateSlice.withdrawAsset)
      withdrawAsset = newStateSlice.withdrawAsset;
    else 
      withdrawAsset = this.state.withdrawAsset;

    const futureState = {
      ...this.state,
      ...newStateSlice
    }

    const that = this;

    // get the list of balances
    let formattedArray;

    if (selectedPool.chainId === 1)
      formattedArray = underlyingBalances.map(function(balance, i) {
        return parseFloat(that.formatAssetBalance(underlyingBalances[i], selectedPool.assets[i].decimals))
      })
    else if (selectedPool.chainId === 56)
      formattedArray = [...new Array(4).fill(0)]; 

    // get the sum
    const total = parseFloat(sumArray(formattedArray
      .filter((asset, i) => withdrawAsset.indexOf(selectedPool.assets[i].symbol) > -1)  
    ));

    // use pool input amount or sum of each input
    const amount = poolAmount ? parseFloat(poolAmount) : 
      sumArray(selectedPool.assets.filter((asset, i) => 
        withdrawAsset.indexOf(selectedPool.assets[i].symbol) > -1  
      ).map(asset => futureState[`${asset.symbol}Amount`]))

    formattedArray.forEach(function(num, i){

      if (selectedPool.chainId === 1 && withdrawAsset.indexOf(selectedPool.assets[i].symbol) > -1) {
        // percent of the pool the asset has 
        const percent = num / total

        // how much of token i is to be received
        const receive = parseFloat(amount) * percent

        // update state value
        futureState[`${selectedPool.assets[i].symbol}Amount`] = receive.toString()
      } else {
        futureState[`${selectedPool.assets[i].symbol}Amount`] = '0'
      }

    });

    if (parseFloat(amount) > parseFloat(selectedPool.balance))
      this.setState({ poolAmountError: true })
    else 
      this.setState({ poolAmountError: false })

    const divide = 10; 

    // amounts for slippage
    let amounts = [];
    for(let i = 0; i < selectedPool.assets.length; i++) {
      // sanitize inputs
      if (
        isNaN(futureState[selectedPool.assets[i].symbol+'Amount']) || 
        futureState[selectedPool.assets[i].symbol+'Amount'] === ''
      )
        amounts.push('0')
      else
        selectedPool.chainId === 1 ? 
          amounts.push(futureState[selectedPool.assets[i].symbol+'Amount']) :
          amounts.push((parseFloat(poolAmount)/divide).toString())
    }

    let index;
    if (withdrawAsset.length === 1)
      index = selectedPool.assets.findIndex(asset => asset.symbol === withdrawAsset[0]);

    // don't get amounts if there are any bad values
    if (
      amounts.filter((value) => isNaN(value)).length > 0 ||
      parseFloat(poolAmount) === 0
    )
      return;

    dispatcher.dispatch({
      type: GET_WITHDRAW_AMOUNT, 
      content: { 
        pool: selectedPool, 
        amounts, poolAmount,
        account: futureState.account,
        assets: withdrawAsset.length,
        index,
      }
    })

  }

  getDepositAmount = (newStateSlice = {}) => {
    const futureState = {
      ...this.state,
      ...newStateSlice,
    };

    const { selectedPool, activeTab } = futureState;

    if (!selectedPool || activeTab !== 'deposit') return;

    this.setState({
      depositAmount: '',
    });

    if (!selectedPool.isPoolSeeded) return;

    const amounts = selectedPool.assets
      .map(({ symbol }) => futureState[`${symbol}Amount`]) // Gather balances for that pool from state
      .map((amount) => (amount === '' || isNaN(amount)) ? '0' : amount.toString()) // Sanitize

    dispatcher.dispatch({ 
      type: GET_DEPOSIT_AMOUNT, 
      content: { 
        pool: selectedPool, 
        amounts, 
        account: futureState.account
      }
    })
  }

  getDepositAmountReturned = (val) => {
    this.setState({ depositAmount: val })
  }

  getWithdrawAmountReturned = (vals) => {
    const { withdrawAmount, direction, slippage, receiveAmounts, virtPrice } = vals;
    const { selectedPool, underlyingBalances, withdrawAsset } = this.state

    let futureState = {
      ...this.state
    };

    if (direction === 'assets') {

      if (selectedPool.chainId === 1) {
        const that = this;

        // get the list of balances
        const formattedArray = underlyingBalances
        .map(function(balance, i) {
          return parseFloat(that.formatAssetBalance(underlyingBalances[i], selectedPool.assets[i].decimals))
        })

        // get the sum
        const total = parseFloat(sumArray(formattedArray
          .filter((asset, i) => withdrawAsset.indexOf(selectedPool.assets[i].symbol) > -1)  
        ));

        // difference between caculated burn and max_burn
        const diff = parseFloat(futureState['poolAmount']) < parseFloat(withdrawAmount) ? 
                      parseFloat(withdrawAmount) - parseFloat(futureState['poolAmount']) : 0

        formattedArray.forEach(function(num, i){

          if (withdrawAsset.indexOf(selectedPool.assets[i].symbol) > -1) {
            // percent of the pool the asset has 
            const percent = num / total

            let receive;
            // how much of token i is to be received
            // scale down by % difference between _max_burn and calculated burn 
            if (diff > 0 && withdrawAsset.length !== 1 && withdrawAsset.length !== selectedPool.assets.length)
              receive = (parseFloat(withdrawAmount) * percent) - ((diff/4) * slippage)
            else
              receive = parseFloat(withdrawAmount) * percent

            // update state value
            futureState[`${selectedPool.assets[i].symbol}Amount`] = (receive * virtPrice).toFixed(5);
          } else {
            futureState[`${selectedPool.assets[i].symbol}Amount`] = '0';
          }

        });
      } else if (selectedPool.chainId === 56) {

        if (receiveAmounts) {
          let unused = 0;
          let largest = 0;
          let index = 0;

          // get the sum of the amounts returned
          const sum = receiveAmounts.reduce((a, b) => parseFloat(a) + parseFloat(b))

          // get difference if sum is greater than the input amount
          let diff = (sum - parseFloat(futureState['poolAmount']))
          if (diff < 0) diff = 0;

          receiveAmounts.forEach(function (receive, i) {
            if (withdrawAsset.indexOf(selectedPool.assets[i].symbol) > -1) {
              // keep track of largest
              if (receive > largest) {
                largest = receive;
                index = i;
              }

              // update state value and scale by slippage / difference if needed
              futureState[`${selectedPool.assets[i].symbol}Amount`] = ((receive - (diff/4)) * virtPrice);

            } else {
              unused += parseFloat((receive - (diff/4)));
              futureState[`${selectedPool.assets[i].symbol}Amount`] = "0";
            }

          });

          // add unused to asset with largest percentage in pool
          futureState[`${selectedPool.assets[index].symbol}Amount`] = parseFloat(
            futureState[`${selectedPool.assets[index].symbol}Amount`]
          ) + parseFloat(unused);

        } else {
          selectedPool.assets.forEach(function(receive, i){
            if (withdrawAsset.indexOf(selectedPool.assets[i].symbol) > -1) {
              // update state value
              futureState[`${selectedPool.assets[i].symbol}Amount`] = withdrawAmount;
            } else {
              futureState[`${selectedPool.assets[i].symbol}Amount`] = '0';
            }
          });
        }

      }

      this.setState(futureState);
    } else if (direction === 'pool') {
      this.setState({
        'poolAmount': withdrawAmount
      })
    }
  }

  balancesReturned = () => {
    const pools = store.getStore('pools')
    const selectedPool = store.getStore('selectedPool')

    let balances = {}

    // set asset balances
    selectedPool.assets.forEach(asset => {
      balances[`${asset.symbol}Amount`] = asset.balance
    })

    this.setState({
      pools,
      selectedPool,
      ...balances
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
      selectedPool,
      showExpired
    } = this.state

    return (
      <div className={ classes.valContainer }>
        <div className={ classes.flexy }>
          <div className={ classes.label }>
            <Typography variant='h4'>pool</Typography>
          </div>
          <div className={ classes.showExpired }>
            <FormControlLabel
								control={<Checkbox checked={showExpired} onClick={() => this.setState({showExpired: !showExpired})} name='showExpired' />}
								label='Show expired pools'
						/>
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
            type="number"
            InputProps={{
              endAdornment: <div className={ classes.assetContainer }>{ this.renderPoolSelectAsset("pool") }</div>,
            }}
          />
        </div>
          <div className={ `${classes.flexy} ${classes.underPool}` }>
            <div className={ `${classes.label} ${classes.balances}`}>
              <Typography variant='h4'>{this.formatPoolName(selectedPool, false)}</Typography>
            </div>
            <div className={` ${classes.balances}`}>
            { (selectedPool ? (<Typography variant='h4' onClick={ () => { this.setAmount('pool', (selectedPool ? floatToFixed(selectedPool.balance, selectedPool.decimals) : '0')) } } className={ classes.value } noWrap>{ ''+ ( selectedPool && selectedPool.balance ? floatToFixed(selectedPool.balance, 4) : '0.0000') } { selectedPool ? selectedPool.id : '' }</Typography>) : <Typography variant='h4' className={ classes.value } noWrap>Balance: -</Typography>) }
            </div>
          </div>
      </div>
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

  renderAssetSelect = (id) => {
    const { selectedPool, withdrawAsset } = this.state
    const { classes } = this.props

    return (
      <React.Fragment>
        <div className={ classes.label }>
          <Typography variant='h4' >
            Withdraw In
          </Typography>
        </div>
        { selectedPool.assets.map((asset) => {
          return(
            <div className={ classes.flexy }>
              <Checkbox 
                onChange={this.onAssetSelectChange} 
                checked={(withdrawAsset.indexOf(asset.symbol) > -1)}
                value={asset.symbol}
              />
              <div className={ classes.assetSelectIcon }>
                <img
                  alt={asset.name}
                  src={ this.getLogoForAsset(asset) }
                  height="30px"
                />
              </div>
              <Typography>{asset.symbol}</Typography>
            </div>
          )
        }) }
      </React.Fragment>
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
        { pools ? pools.map((pool, i) => { return this.renderPoolOption(pool, i) }) : null }
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
      </MenuItem>
    )
  }

  formatPoolName = (pool, showSymbol = true) => {

    // format the name of the pool
    const rcSymbol = pool.assets[0].symbol;
    const collateral = rcSymbol.split('_')[1];
    const paired = rcSymbol.split('_')[3]

    // format message 
    let poolName = `${collateral} - ${paired}`;
    if (showSymbol) poolName +=  ` (${rcSymbol})`;

    return(poolName);

  }

  renderPoolSelect = (id) => {
    const { loading, pools, pool, showExpired, selectedPool } = this.state
    const { classes } = this.props

    return (
      <div className={ classes.valContainer }>
        <div className={ classes.flexy }>
          <div className={ classes.label }>
            <Typography variant='h4'>pool</Typography>
          </div>
          <div className={ classes.showExpired }>
            <FormControlLabel
								control={<Checkbox checked={showExpired} onClick={() => this.setState({showExpired: !showExpired})} name='showExpired' />}
								label='Show expired pools'
						/>
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
              renderValue: () => {
                return (
                  <div className={ classes.assetSelectIconName }>
                    <Typography variant='h4'>{selectedPool && this.formatPoolName(selectedPool)}</Typography>
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
            { pools ? pools.map((pool, i) => { return this.renderPoolOption(pool, i) }) : null }
          </TextField>
        </div>
      </div>
    )
  }

  renderPoolOption = (option, index) => {
    const { classes } = this.props
    const { showExpired } = this.state;

    // "Curve.fi Factory USD Metapool: RC_PUNK-B_10000_DAI_2021_4_30" => RC_PUNK-B_10000_DAI_2021_4_30
    let name;
    if (option && option.chainId === 1)
      name = option.name.substring(option.name.indexOf(":") + 2);
    else if (option && option.chainId === 56) {
      if (option.name.indexOf("Metapool") !== -1)
        name = option.name.substring(option.name.indexOf("RC_"), option.name.indexOf("Metapool") - 1);
      else 
        name = option.name;
    }

		const collateral = name.split("_")[1];
		const paired = name.split("_")[3];

    // get the expiry
    const expiry = name.split('_').slice(Math.max(name.split('_').length - 3, 1));
    const year = expiry[0];
    const month = expiry[1];
    const day = expiry[2];

    const expiryDate = new Date(`${year}-${month}-${day}`);
    const now = new Date();
    const expired = expiryDate <= now;

    if (!expired || showExpired)
      return (
        <MenuItem key={option.name} 
                  value={option.name} 
                  className={ `${classes.assetSelectMenu} ${index % 2 === 0 ? 'darker' : ''}` }
        >
          <div className={ classes.poolSelectOption }>
            <img style={{boxShadow: colors.boxShadow, height: '30px', marginRight: '10px', borderRadius: '100%'}} alt={collateral} src={this.getLogoForAsset({symbol: collateral})}></img>
            <div>
              <Typography variant='body'>{ `${collateral} - ${paired} (${name})` }</Typography>
              { option.balance > 0 ? <Typography variant='subtitle2' className={ classes.gray }><b>Bal: { option.balance ? parseFloat(option.balance).toFixed(4) : '' }</b></Typography> : '' }
            </div>
            { expired ? <Typography variant='h5' className={classes.expired}>expired</Typography> : <div></div>}
          </div>
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


    // button disabled conditions
    let disabled = isNaN(depositAmount) || 
                    depositAmount === '' ||
                    parseFloat(depositAmount) === 0 ||
                    loading

    // exception for seeding pools
    if (selectedPool && !selectedPool.isPoolSeeded) {
      disabled = parseFloat(this.state[selectedPool.assets[0].symbol + "Amount"]) <= 0 ||
                  this.state[selectedPool.assets[0].symbol + "Amount"] === '' ? true : false;

      let count = 0;

      // get number of assets being input
      for (const asset of selectedPool.assets) {
        if (asset === selectedPool.assets[0]) continue;
        if (parseFloat(this.state[asset.symbol + "Amount"]) > 0 && !this.state[asset.symbol + "AmountError"]) count++;
      }

      // check if at least one underlying asset is being added
      disabled = count >= 1 ? false : true;
    }

    // check if user has input more than their token balance
    if (selectedPool)
      for (const asset of selectedPool.assets)
        if (this.state[asset.symbol + "AmountError"] === true) insufficientBalance = true

    disabled = disabled || insufficientBalance

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
              endAdornment: <Typography variant='h5'className={ classes.depositAmount } >{selectedPool ? selectedPool.symbol : ''}</Typography>
            }}
          />
        </div>
        <SlippageInfo slippagePcent={slippagePcent} />
      </div>
    )
  }

  renderWithdrawAmount = () => {
    const { classes } = this.props

    const {
      depositAmount,
      selectedPool,
    } = this.state;
    if (selectedPool && !selectedPool.isPoolSeeded) return null;

    return(
      <div className={classes.valContainer}>
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
          />
        </div>
      </div>
    );
  }

  renderWithdraw = () => {
    const { classes } = this.props;
    const { 
      loading,
      poolAmount, 
      selectedPool, 
      poolAmountError,
      slippagePcent,
      withdrawAsset } = this.state;

    // button disabled conditions
    const disabled = !poolAmount || 
                      poolAmount === '' || 
                      parseFloat(poolAmount) === 0 ||
                      poolAmountError || 
                      loading;

    let showSlippage = !isNaN(slippagePcent);

    // don't show slippage for 2 - 3 assets on ETH mainnet
    if (selectedPool.chainId === 1)
      showSlippage =
        showSlippage &&
        (withdrawAsset.length === 1 ||
        withdrawAsset.length === selectedPool.assets.length);
    // temporarily hiding withdraw slippage on bsc to fix calc
    else if (selectedPool.chainId === 56)
      showSlippage = false;

    return (
      <React.Fragment>
        {this.renderPoolSelectInput()}
        {selectedPool &&
          selectedPool.assets &&
          selectedPool.assets.length > 0 &&
          selectedPool.assets.map((asset) => {
            return this.renderAssetInput(asset, "withdraw");
          })}
        {this.renderAssetSelect("Withdraw In")}
        {withdrawAsset.length > 1 &&
        withdrawAsset.length < selectedPool.assets.length ? (
          <div className={classes.alert}>
            <Alert severity="info">
              If you withdraw 2-3 assets only, the RC token must be selected,
              and due to{" "}
              <a
                href="https://curve.readthedocs.io/factory-pools.html#StableSwap.remove_liquidity_imbalance"
                rel="noopener noreferrer"
                target="_blank"
              >
                Curve calculation
              </a>
              , you will be left with some dust
            </Alert>
          </div>
        ) : (
          ""
        )}
        {showSlippage ? <SlippageInfo slippagePcent={slippagePcent} /> : ""}
        <Button
          className={classes.actionButton}
          variant="outlined"
          color="primary"
          disabled={disabled}
          onClick={this.onWithdraw}
          fullWidth
        >
          <Typography
            className={classes.buttonText}
            variant={"h4"}
            color="secondary"
          >
            {"Withdraw"}
          </Typography>
        </Button>
      </React.Fragment>
    );
  }

  startLoading = () => {
    this.setState({ loading: true })
  }

  renderAssetInput = (asset, DorW) => {
    const { classes } = this.props;
    const { loading, selectedPool } = this.state;

    let type = asset.symbol;

    const amount = this.state[type+"Amount"]

    // error input if user inputs more than their balance
    const amountError = this.state[type+"AmountError"] 

    // input disable logic
    const disabled = (loading && !amountError) || 
                      (selectedPool.chainId === 56 && DorW === 'withdraw')

    return (
      <div className={ classes.valContainer }>
        <div className={ classes.flexy }>
          <div className={ classes.label }>
            <Typography variant='h4'>
              { asset.name }
            </Typography>
          </div>
          <div className={ classes.balances }>
            { (asset  ? (<Typography variant='h4' onClick={ () => { if(DorW === 'withdraw') { return false; } this.setAmount(type, (asset ? floatToFixed(asset.balance, asset.decimals) : '0')) } } className={ classes.value } noWrap>{ ''+ ( asset && asset.balance && DorW === 'deposit' ? floatToFixed(asset.balance, 4) : '') } { asset ? asset.symbol : '' }</Typography>) : <div></div>) }
          </div>
        </div>
        <div>
          <TextField
            fullWidth
            disabled={ disabled }
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
              </div>
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
      return pool.name=== event.target.value
    })

    const newStateSlice = {
      [event.target.name]: selectedPool.symbol,
      selectedPool,
      ...this.getStateSliceUserBalancesForSelectedPool(selectedPool),
    };

    this.setState(newStateSlice);
    this.getDepositAmount(newStateSlice);
    this.getWithdrawAmount(newStateSlice);

    // notify that pool has changed
    dispatcher.dispatch({ type: CHANGE_SELECTED_POOL, content: { pool: selectedPool } })

  }

  // determine if user has sufficient balance for deposits
  determineSufficientDepositBalance = (symbol, balance) => {

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

    const { activeTab, withdrawAsset } = this.state;

    let newStateSlice = {}

    newStateSlice[event.target.id] = event.target.value;

    // get the asset symbol
    const symbol = event.target.id.substring(0,event.target.id.indexOf("Amount"))

    if (activeTab === 'deposit') {
      this.determineSufficientDepositBalance(symbol, event.target.value);
      this.getDepositAmount(newStateSlice);
    } else {

      // don't allow typing into assets that aren't selected
      if (withdrawAsset.indexOf(symbol) === -1 && symbol !== "pool") 
        newStateSlice[event.target.id] = 0;

      this.getWithdrawAmount(newStateSlice);
    }

    this.setState(newStateSlice);
  }

  onAssetSelectChange = (event) => {

    const { selectedPool, withdrawAsset } = this.state;

    if (!selectedPool) return;

    let newStateSlice = {
      ...this.state
    }

    let assets = [...withdrawAsset];

    const change = event.target.checked ? 1 : -1;

    // modify withdraw asset array
    if (!event.target.checked) {
      assets.splice(withdrawAsset.indexOf(event.target.value), 1);
    } else
      assets.push(event.target.value);

    if (withdrawAsset.length + change === 2 || withdrawAsset.length + change === 3)
      assets.push(selectedPool.assets[0].symbol);

    // update and remove duplicates
    newStateSlice['withdrawAsset'] = [...new Set(assets)];

    this.setState(newStateSlice);
    this.getWithdrawAmount(newStateSlice);


  }

  setAmount = (symbol, balance) => {
    let newStateSlice = {
      [`${symbol}Amount`]: balance,
    };

    if (this.state.activeTab === 'deposit'){ 
      this.determineSufficientDepositBalance(symbol, balance);
      this.getDepositAmount(newStateSlice);
    } else {
      this.getWithdrawAmount(newStateSlice);
      newStateSlice["slippagePcent"] = undefined;
    }

    this.setState(newStateSlice);
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
      if (this.state[selectedPool.assets[i].symbol+'Amount'] === '' || 
          isNaN(this.state[selectedPool.assets[i].symbol+'Amount']))
        amounts.push('0')
      else
        amounts.push(this.state[selectedPool.assets[i].symbol+'Amount'].toString())
    }

    if(!error) {
      this.setState({ loading: true })
      dispatcher.dispatch({ type: DEPOSIT, content: { pool: selectedPool, amounts: amounts } })
    }
  }

  onWithdraw = () => {
    this.setState({ poolAmountError: false })

    const { poolAmount: amount, selectedPool } = this.state;

    const poolAmount = parseFloat(amount);

    if(!poolAmount || isNaN(poolAmount) || poolAmount <= 0 || poolAmount > selectedPool.balance) {
      this.setState({ poolAmountError: true })
      return false;
    }

    // amount of each asset to withdraw
    let amounts = []

    // populate amounts array
    for(let i = 0; i < selectedPool.assets.length; i++) {
      if (this.state[selectedPool.assets[i].symbol+'Amount'] === '')
        amounts.push('0')
      else
        amounts.push(this.state[selectedPool.assets[i].symbol+'Amount'].toString())
    }

    this.setState({ loading: true })
    dispatcher.dispatch({ type: WITHDRAW, content: { amount, pool: selectedPool, amounts} })
  }
}

export default withRouter(withStyles(styles)(Liquidity));
