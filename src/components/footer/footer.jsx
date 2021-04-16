import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import GitHubIcon from '@material-ui/icons/GitHub';

import { colors, darkTheme } from '../../theme'

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

    this.state = {}
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.footer}>
        <div className={ classes.footerLink } onClick={()=> window.open("https://app.rulerprotocol.com/", "_blank")}>
          <img alt="" src={ require('../../assets/Ruler-logo-circle.png') } height='23px' className={ classes.icon } />
          <Typography variant={ 'h4'} >Ruler App</Typography>
        </div>
        <div className={ classes.footerLink } onClick={()=> window.open("https://curve.readthedocs.io/factory-deployer.html#metapool-factory-deployer-and-registry", "_blank")}>
          <DescriptionIcon height='15px' className={ classes.icon } />
          <Typography variant={ 'h4'} >Curve Metapool Docs</Typography>
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
