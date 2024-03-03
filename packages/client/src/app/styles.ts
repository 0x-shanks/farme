import { ToastProviderProps, extendTheme } from "@chakra-ui/react";

export const toastOption: ToastProviderProps = {
  defaultOptions: {
    position: "bottom",
    isClosable: true,
    containerStyle: {
      // fontFamily: poppins.style.fontFamily,
      fontSize: "1rem",
    },
  },
};

export const theme = extendTheme({
  styles: {
    global: {
      body: {},
    },
  },
  config: {
    // initialColorMode: "dark",
    useSystemColorMode: false,
  },
  breakpoints: {
    sm: "390px",
    md: "500px",
    lg: "768px",
  },
  colors: {
    primary: {
      500: "#D5EE5A",
    },
    secondary: {
      500: "#7672FE",
    },
    "card-bg": "#21212F",
  },
});
