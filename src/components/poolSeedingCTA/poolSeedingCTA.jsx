import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Alert } from '@material-ui/lab'
import { withStyles } from '@material-ui/core/styles'
import { useHistory } from 'react-router-dom'
import { getExplorerURL } from '../../utils/helpers'

const styles = () => ({
  alert: {
    margin: '0 auto',
    width: '100%'
  },
  link: {
    color: 'inherit',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
});

const AssetLink = ({ erc20address, symbol, classes, pool }) => (
  <a href={`${getExplorerURL(pool.chainId)}/token/${erc20address}`} target="_blank" rel="noopener noreferrer" className={classes.link}>{symbol}</a>
);

const DepositPageLink = ({ pool, classes }) => {
  const history = useHistory();

  return (
    <span onClick={() => history.push(`/liquidity/${pool.address}`)} className={classes.link}>Seed pool yourself</span>
  );
};

const PoolSeedingCTA = ({
  classes,
  pool,
  isDepositForm,
}) => {
  const poolContainsUnexpectedAssetsCount = pool.assets.length < 2;
  if (poolContainsUnexpectedAssetsCount) return null;

  const firstAsset = pool.assets[0];
  const metaPoolAssets = pool.assets.slice(1);

  return (
    <Alert icon={false} color="warning" className={classes.alert}>
      This pool is still empty. It needs to be seeded with an initial deposit in order to enable swaps.
      {isDepositForm ? (
        <Fragment>
          <br />Assuming an exchange rate of 1:1, this pool should be seeded with 50% <AssetLink pool={pool} {...firstAsset} classes={classes} />, and 50% {metaPoolAssets.map((asset) => <AssetLink {...asset} pool={pool} classes={classes} />).reduce((a, b) => [a, '+', b])}.
        </Fragment>
      ) : (
        <Fragment>
          <br /><DepositPageLink pool={pool} classes={classes} />
        </Fragment>
      )}
    </Alert>
  )
}

PoolSeedingCTA.propTypes = {
  classes: PropTypes.object.isRequired,
  pool: PropTypes.object.isRequired,
  isDepositForm: PropTypes.bool,
}

PoolSeedingCTA.defaultProps = {
  isDepositForm: false,
}

export default withStyles(styles)(PoolSeedingCTA);
