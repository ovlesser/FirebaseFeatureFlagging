/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {type PropsWithChildren, useEffect, useState} from 'react';
import analytics from '@react-native-firebase/analytics';
import remoteConfig, {
  FirebaseRemoteConfigTypes,
} from '@react-native-firebase/remote-config';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors, Header} from 'react-native/Libraries/NewAppScreen';

const firebaseAnalytics = analytics();
const Section: React.FC<
  PropsWithChildren<{
    title: string;
  }>
> = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const App = (): JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [featureFlags, setFeatureFlags] =
    useState<FirebaseRemoteConfigTypes.ConfigValues>({});

  const [email, setEmail] = useState('');
  useEffect(() => {
    const showAlert = () => {
      Alert.prompt(
        'Email Address',
        'Please enter your email address:',
        async (inputEmail: string) => {
          setEmail(inputEmail);
          // await firebaseAnalytics.setUserId(inputEmail);
          await firebaseAnalytics.setUserProperty('email', inputEmail);
          // await firebaseAnalytics.logEvent('login', {email: inputEmail});

          setTimeout(async () => {
            await remoteConfig().fetch(0);
            await remoteConfig().activate();
            // const flag = remoteConfig().getValue('Feature_Flag');
            // console.log({flag});
            const config = remoteConfig().getAll();
            console.log(config);
            setFeatureFlags(config);
          }, 1000);
        },
      );
    };

    showAlert();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title={email}>
            {JSON.stringify(featureFlags, undefined, 4)}
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
