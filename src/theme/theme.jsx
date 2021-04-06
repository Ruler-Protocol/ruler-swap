import createBreakpoints from '@material-ui/core/styles/createBreakpoints'

import WorkSansTTF from '../assets/fonts/WorkSans-VariableFont_wght.ttf';

const WorkSans = {
  fontFamily: 'Work Sans Thin',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `
    local('Work Sans Thin'),
    local('Work Sans Thin'),
    url(${WorkSansTTF}) format('truetype')
  `,
  unicodeRange:
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF',
};

export const colors = {
	dark: "#2C313C",
	midDark: "#4f4e4e",
	lightDark: "#3C4655",
	pink: "#E7C5C2",
	darkPink: "#d4b6b4",
	blue: "#a3c7d2",
  light: "#EDE9E6",
  rulerWhite: "#EDE9E6",
  rulerOrange: "#C05D4F",
  rulerDark: "#3C4655",
  rulerDarker: "#2C313C",
	disabled: "rgb(106 106 106 / 80%)",
	lightGreen: "lightgreen",
	white: "#ffffff",
	white40: "#ffffff40",
	white60: "#ffffff60",
	white80: "#ffffff80",
	whiteA1: "#ffffffa1",
	secondaryGray: "#bfc2ce",
	lightBlue: "lightblue",
	darkLightBlue: "#7BA6B4",
	darkLightBlue2: "rgb(133, 166, 180)",
	black: "black",
	yellow: "yellow",
	gradient: "radial-gradient(174.47% 188.91% at 1.84% 0%, rgb(192, 93, 79) 0%, blue 100%), rgb(255, 255, 255)",
	darkBrown: "rgb(92 92 92)",
  gray: "#e1e1e1",
  lightGray: "#737373",
  lightBlack: "#6a6a6a",
  darkBlack: "#141414",
  green: '#1abc9c',
  red: '#ed4337',
  orange: 'orange',
  compoundGreen: '#00d395',
  tomato: '#e56b73',
  purple: '#935dff',
  text: "#212529",
  topaz: "#0b8f92",
};

const breakpoints = createBreakpoints({
  keys: ["xs", "sm", "md", "lg", "xl"],
  values: {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1800
  }
})

export const darkTheme = {
  '@global': {
    '.MuiPopover-paper h4': {
      color: colors.text + ' !important'
    },
  },
  inputContainer: {
    display: 'flex',
    padding: '30px',
    borderRadius: '4px',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    margin: '40px 0px',
    border: '1px solid '+colors.rulerDark,
    maxWidth: '650px',
    minWidth: '650px',
    background: colors.rulerDark,
    color: colors.white,
    boxShadow: '0px 5px 18px -4px rgba(0, 0, 0, 0.35)'
  },
  actionInput: {
    background: colors.rulerDarker,
    border: '1px solid ' + colors.rulerDark,
    borderRadius: '4px',
    '& input::placeholder': {
      color: colors.white
    },
    '& input': {
      color: colors.white,
    },
    '& .MuiOutlinedInput-root':{
      borderRadius: '4px'
    },
    '& #pool .MuiTypography-root': {
      color: colors.white
    }
  },
  actionButton: {
    '&:hover': {
      backgroundColor: colors.rulerOrange,
      filter: 'brightness(90%)',
      border: '0px'
    },
    '&:disabled': {
      backgroundColor: colors.disabled
    },
    transition: 'all ease 0.3s',
    marginTop: '24px',
    padding: '12px',
    border: '0px',
    backgroundColor: colors.rulerOrange,
    borderRadius: '4px',
    fontWeight: 500,
    [breakpoints.up('md')]: {
      padding: '15px',
    }
  },
  walletAddress: {
    padding: '8px 15px',
    border: '1px solid rgba(255, 255, 255, 0.376)',
    fontWeight: '500',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    [breakpoints.down('sm')]: {
      display: 'flex',
      position: 'absolute',
      top: '90px',
      border: "1px solid "+colors.pink,
      background: colors.white
    }
  },
  assetInfoContainer: {
    width: '100%',
    background: colors.rulerDarker,
    borderRadius: '10px',
    padding: '24px',
  },
  disclaimer: {
    padding: '12px',
    border: '0px',
    borderRadius: '4px',
    marginBottom: '24px',
    fontWeight: 1,
    background: colors.rulerDark,
    color: colors.white,
    boxShadow: '0px 5px 18px -4px rgba(0, 0, 0, 0.35)'
  },
  toggleHeading: {
    flex: 1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '24px',
    color: colors.whiteA1
  },
  infoLink: {
    color: colors.white,
  },
  footer: {
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-evenly',
    width: '100%',
    background: colors.rulerDarker,
    // borderRadius: '50px 50px 0px 0px',
    border: 'none',
    borderBottom: 'none',
    marginTop: '48px',
    flexWrap: 'wrap',
    [breakpoints.down('xs')]: {
      justifyContent: 'flex-start',
    }
  },
  footerLink: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: colors.white,
    '&:hover': {
      textDecoration: 'underline'
    },
  },
  toggleHeadingActive: {
    flex: 1,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '24px',
    textDecoration: 'underline',
    textDecorationColor: colors.rulerOrange,
    color: colors.white,
  },
  assetSelectIconName: {
    display: 'inline-block',
    verticalAlign: 'middle',
    color: colors.white,
    flex: 1,
    '& .MuiTypography-root': {
      color: colors.text
    }
  },
  assetContainer: {
    '& .MuiTypography-root': {
      color: colors.white
    }
  },
  assetSelectIcon: {
    display: 'inline-block',
    verticalAlign: 'middle',
    borderRadius: '10px',
    background: 'none',
    height: '30px',
    width: '30px',
    textAlign: 'center',
    cursor: 'pointer',
    marginRight: '12px'
  },
  depositAmount: {
    color: colors.white,
    width: 'auto',
    textAlign: 'right',
    whiteSpace: 'nowrap'
  },
  showExpired: {
    flex: 1,
    paddingLeft: '12px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    maxHeight: '20px',
    '& svg': {
      transform: 'translateY(-1px)',
      color: colors.white,
    },
    '& span': {
      padding: '0',
      marginLeft: '2px',
      color: colors.white,
    },
  },
  link: {
    padding: '12px 0px',
    margin: '0px 12px',
    cursor: 'pointer',
    color: colors.whiteA1,
    '&:hover': {
      paddingBottom: '9px',
      borderBottom: "3px solid "+ colors.rulerOrange,
    },
  },
  title: {
    textTransform: 'capitalize'
  },
  linkActive: {
    padding: '12px 0px',
    margin: '0px 12px',
    cursor: 'pointer',
    color: colors.white,
    paddingBottom: '9px',
    borderBottom: "3px solid "+ colors.rulerOrange,
  },
  headerV2: {
    background: '#282B31',
    border: 'none',
    borderTop: 'none',
    width: '100%',
    color: colors.white,
    // borderRadius: '0px 0px 50px 50px',
    display: 'flex',
    padding: '20px 32px',
    alignItems: 'center',
    justifyContent: 'center',
    [breakpoints.down('sm')]: {
      justifyContent: 'space-between',
      padding: '16px 24px'
    }
  },
}

const iswapTheme =  {
  typography: {
    fontFamily: [
      '"Work Sans Thin"',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '48px',
      fontWeight: '600',
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      lineHeight: 1.2
    },
    h2: {
      fontSize: '36px',
      fontWeight: '600',
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      lineHeight: 1.2
    },
    h3: {
      fontSize: '22px',
      fontWeight: '600',
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      lineHeight: 1.2
    },
    h4: {
      fontSize: '16px',
      fontWeight: '600',
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      lineHeight: 1.2
    },
    h5: {
      fontSize: '14px',
      fontWeight: '600',
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      lineHeight: 1.2
    },
    body1: {
      fontSize: '16px',
      fontWeight: '300',
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
    body2: {
      fontSize: '16px',
      fontWeight: '300',
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
  },
  type: 'light',
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [WorkSans],
      },
    },
    MuiSelect: {
      select: {
        "&:focus": {
          borderRadius: '10px'
        },
        padding: '9px'
      },
      selectMenu: {
        minHeight: '30px',
        display: 'flex',
        alignItems: 'center'
      }
    },
    MuiButton: {
      root: {
        borderRadius: '10px',
        padding: '10px 24px'
      },
      outlined: {
        padding: '10px 24px',
        borderWidth: '2px !important'
      },
      text: {
        padding: '10px 24px'
      },
      label: {
        textTransform: 'none',
        fontSize: '1rem'
      }
    },
    MuiInputBase: {
      input: {
        fontSize: '16px',
        fontWeight: '600',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        lineHeight: 1.2
      }
    },
    MuiInput: {
      underline: {
        '&:before': { //underline color when textfield is inactive
          borderBottom: 'none !important'
        },
        '&:after': { //underline color when textfield is inactive
          borderBottom: 'none !important'
        },
      }
    },
    MuiOutlinedInput: {
      input: {
        "&::placeholder": {
          color: colors.text
        },
        color: colors.text,
        padding: '14px',
        borderRadius: '10px'
      },
      root: {
        // border: "none !important",
        borderRadius: '10px'
      },
      notchedOutline: {
        // border: "none !important"
      }
    },
    MuiSnackbar : {
      root: {
        maxWidth: 'calc(100vw - 24px)'
      },
      anchorOriginBottomLeft: {
        bottom: '12px',
        left: '12px',
        '@media (min-width: 960px)': {
          bottom: '50px',
          left: '80px'
        }
      }
    },
    MuiSnackbarContent: {
      root: {
        backgroundColor: colors.white,
        padding: '0px',
        minWidth: 'auto',
        '@media (min-width: 960px)': {
          minWidth: '500px',
        }
      },
      message: {
        padding: '0px'
      },
      action: {
        marginRight: '0px'
      }
    },
    MuiAccordion: {
      root: {
        border: '1px solid '+colors.pink,
        borderRadius: '10px',
        margin: '8px 0px',
        '&:before': { //underline color when textfield is inactive
          backgroundColor: 'none',
          height: '0px'
        },
      }
    },
    MuiAccordionSummary: {
      root: {
        padding: '12px 24px',
        '@media (min-width: 960px)': {
          padding: '30px 42px',
        }
      },
      content: {
        margin: '0px !important'
      }
    },
    MuiAccordionDetails: {
      root: {
        padding: '0 12px 15px 12px',
        '@media (min-width: 960px)': {
          padding: '0 24px 30px 24px',
        }
      }
    },
    MuiToggleButton: {
      root: {
        borderRadius: '10px',
        textTransform: 'none',
        minWidth:  '100px',
        border: 'none',
        background: colors.white,
        '& > span > h4': {
          color: '#555',
        },
        '&:hover': {
          backgroundColor: "rgba(47,128,237, 0.2)",
        },
        "&$selected": {
          backgroundColor: '#2f80ed',
          '& > span > h4': {
            color: '#fff',
          },
          '&:hover': {
            backgroundColor: "rgba(47,128,237, 0.2)",
            '& > span > h4': {
              color: '#000',
            },
          },
        }
      }
    },
    MuiPaper: {
      elevation1: {
        boxShadow: 'none'
      }
    },
    MuiToggleButtonGroup: {
      root: {
        border: '1px solid '+colors.pink,
        borderRadius: '10px',
      },
      groupedSizeSmall: {
        padding: '42px 30px'
      }
    },
    MuiFormControlLabel: {
      label: {
        color: colors.darkBlack,
        fontSize: '14px',
        fontWeight: '600',
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        lineHeight: 1.2
      }
    }
  },
  palette: {
    primary: {
      main: colors.blue
    },
    secondary: {
      main: colors.topaz
    },
    text: {
      primary: colors.text,
      secondary: colors.text
    }
  },
  breakpoints: breakpoints
};

export default iswapTheme;
