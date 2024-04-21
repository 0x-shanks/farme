import { ToastProviderProps, extendTheme } from '@chakra-ui/react';

export const toastOption: ToastProviderProps = {
  defaultOptions: {
    position: 'bottom',
    isClosable: true,
    containerStyle: {
      // fontFamily: poppins.style.fontFamily,
      fontSize: '1rem'
    }
  }
};

export const theme = extendTheme({
  styles: {
    global: {
      body: {}
    }
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false
  },
  breakpoints: {
    sm: '390px',
    md: '500px',
    lg: '768px'
  },
  colors: {
    primary: {
      '50': '#e9e9ff',
      '100': '#c8c8ff',
      '200': '#a0a5ff',
      '300': '#7480ff',
      '400': '#5062ff',
      '500': '#2141fb',
      '600': '#1d38ef',
      '700': '#082be2',
      '800': '#001bd8',
      '900': '#0000be'
    }
  }
});
