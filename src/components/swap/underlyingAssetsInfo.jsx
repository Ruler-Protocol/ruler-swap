import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { colors, darkTheme } from '../../theme'

const styles = () => ({
  info: {
    paddingLeft: '12px',
  },
  infoLink: {
    color: colors.text,
  },
  ...darkTheme
});

const UnderlyingAssetsInfo = ({
  selectedPool,
  classes,
}) => {
  if (!selectedPool) return null;

  const poolContainsUnexpectedAssetsCount = selectedPool.assets.length < 2;
  if (poolContainsUnexpectedAssetsCount) return null;

  const firstAsset = selectedPool.assets[0];
  const metaPoolAssets = selectedPool.assets.slice(1);

  return (
    <div className={classes.info}>
      Swap between{' '}
      <a href={`https://etherscan.io/token/${firstAsset.erc20address}`} target="_blank" rel="noopener noreferrer" className={classes.infoLink}>{firstAsset.symbol}</a>/
      {metaPoolAssets.map(({ symbol }) => symbol).join('/')}
    </div>
  )
}

UnderlyingAssetsInfo.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(UnderlyingAssetsInfo);
