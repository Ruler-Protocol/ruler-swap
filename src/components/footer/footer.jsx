import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import GitHubIcon from '@material-ui/icons/GitHub';
import {
  CONFIGURE_RETURNED,
} from '../../constants'
import { colors, darkTheme } from '../../theme'
import Store from "../../stores";
const emitter = Store.emitter
const store = Store.store

const styles = theme => ({
  footer: {
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-evenly',
    width: '100%',
    background: colors.white,
    // borderRadius: '50px 50px 0px 0px',
    border: '1px solid '+colors.pink,
    borderBottom: 'none',
    marginTop: '48px',
    flexWrap: 'wrap',
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'flex-start',
    }
  },
  footerLink: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      textDecoration: 'underline'
    },
  },
  icon: {
    marginRight: "6px"
  },
  ...darkTheme
});


class Footer extends Component {

  constructor(props) {
    super()
    this.state = {
      chainId: 1
    }
  }

  componentWillMount() {
    emitter.on(CONFIGURE_RETURNED, this.configureReturned);
  }

  componentWillUnmount() {
    emitter.removeListener(CONFIGURE_RETURNED, this.configureReturned);
  };

  configureReturned = () => {
    const selectedPool = store.getStore('selectedPool') 

    this.setState({
      chainId: selectedPool.chainId
    })
  }

  render() {
    const { classes } = this.props;
    const { chainId } = this.state;
    // docs for curve and nerve
    const curveDocs = 'https://curve.readthedocs.io/factory-deployer.html#metapool-factory-deployer-and-registry';
    const nerveDocs = 'https://docs.nerve.fi/stable-swap-3pool';
    const docsLink = chainId === 1 ? curveDocs : nerveDocs;
    return (
      <div className={classes.footer}>
        <div className={ classes.footerLink } onClick={()=> window.open("https://app.rulerprotocol.com/", "_blank")}>
          <img alt="" src={ require('../../assets/Ruler-logo-circle.png') } height='23px' className={ classes.icon } />
          <Typography variant={ 'h4'} >Ruler App</Typography>
        </div>
        <div className={ classes.footerLink } onClick={()=> window.open(docsLink, "_blank")}>
          <DescriptionIcon height='15px' className={ classes.icon } />
          <Typography variant={ 'h4'} >{chainId === 1 ? 'Curve Metapool Docs' : 'Nerve Metapool Docs'}</Typography>
        </div>
        <div className={ classes.footerLink } onClick={()=> window.open("https://github.com/curvefi/crv.finance", "_blank")}>
          <GitHubIcon height='15px' className={ classes.icon } />
          <Typography variant={ 'h4'} >UI Credit</Typography>
        </div>
      </div>
    )
  }
}

export default withRouter(withStyles(styles)(Footer));
