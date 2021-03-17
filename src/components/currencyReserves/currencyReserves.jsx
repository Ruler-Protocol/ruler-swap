import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import { floatToFixed } from '../../utils/numbers'
import {
  Typography,
} from '@material-ui/core';

import {
  ERROR,
  PRESELECTED_POOL_RETURNED,
} from '../../constants'
import { colors } from '../../theme'
import Loader from '../loader'
import Store from "../../stores";
const emitter = Store.emitter
const store = Store.store



const styles = theme => ({
  inputContainer: {
    display: 'flex',
    padding: '30px',
    borderRadius: '10px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    border: '1px solid '+colors.pink,
    minWidth: '600px',
    background: colors.white
  },
  header: {
      marginBottom: '20px'
  },
  balance: {
      margin: '10px 0'
  }
});

class CurrencyReserves extends Component {

  constructor(props) {
    super()

    const basePools = store.getStore('basePools')
    const pools = store.getStore('pools')
    const selectedPool = store.getStore('selectedPool')  

    const selectedBasePool = basePools && basePools.length > 0 ? basePools[0] : null

    this.state = {
      account: store.getStore('account'),
      pools,
      selectedPool,
      assetInfo: null,
      basePools: basePools,
      basePool: selectedBasePool ? selectedBasePool.name : '',
      selectedBasePool: selectedBasePool,
      loading: !(pools && pools.length > 0 && pools[0].assets.length > 0),
    }
  }
  
  componentWillMount() {
    emitter.on(ERROR, this.errorReturned);
    emitter.on(PRESELECTED_POOL_RETURNED, this.preselectedPoolReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(ERROR, this.errorReturned);
    emitter.removeListener(PRESELECTED_POOL_RETURNED, this.preselectedPoolReturned);
  };

  preselectedPoolReturned = (pool) => {
    // update pools and underlying balance
    this.setState({
        pools: store.getStore('pools'),
        underlyingBalances: store.getStore('underlyingBalances'),
        selectedPool: store.getStore('selectedPool'),
        loading: false
    });
  }

  errorReturned = (error) => {
    this.setState({ loading: false })
  };

  formatAssetBalance = (balance, decimals) => {
    // get index for decimal
    const index = balance.length - decimals;

    // add decimal
    let formattedBalance = parseFloat(balance.substring(0, index) + '.' + balance.substring(index));

    // truncate 
    formattedBalance = floatToFixed(formattedBalance, 2)

    // return with commas 
    return(parseFloat(formattedBalance).toLocaleString("en-US"));
  }

  renderAssetReserves = () => {
    const { underlyingBalances, selectedPool } = this.state
    const { classes } = this.props;

    return(
      <div className={ classes.valContainer }>
        <div className={ classes.flexy }>
          <div className={ classes.balances }>
            { selectedPool && selectedPool.assets ? selectedPool.assets.map((asset,i) => { return(
                <div className={ classes.balance }>
                    <Typography variant='h4'>{ asset.name }</Typography>
                    ${ this.formatAssetBalance(underlyingBalances[i], asset.decimals) }
                </div>
            )}) : <div>fetching liquidity</div>}
          </div>
        </div>
      </div>
    )
  }


  render() {
    const { classes } = this.props;
    const {
      loading,
    } = this.state

    return (
        <div className={ classes.inputContainer }>
          <Typography variant='h3' align='left' className={ classes.header }>Pool Reserves</Typography>
          {this.renderAssetReserves()}
        { loading && <Loader /> }
        </div>
    )
  };

}

export default withRouter(withStyles(styles)(CurrencyReserves));