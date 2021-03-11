import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';

import { colors } from '../../theme'

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
  }
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
        Credit to https://github.com/andrecronje/crv.finance
      </div>
    )
  }
}

export default withRouter(withStyles(styles)(Footer));
