// import * as Linking from 'expo-linking';

// const prefix = Linking.createURL('/');

const linking = {
  prefixes: ['https://deeplink.millonar.com', 'brainbbox://', 'brainbbox811127020515438://'],
  config: {
    screens: {
      Login: 'Login',
      // Profile: 'profile/:id',
    },
  },
};

export default linking;