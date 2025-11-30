import React from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constant';

const SyncProgressCircle = ({ progress, total, message = "Syncing Transactions" }) => {
  const percentage = total > 0 ? Math.min(100, (progress / total) * 100) : 0;
  
  // Animations
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Background with blur effect (simulated) */}
      <View style={styles.backgroundBlur}>
        <View style={styles.circleContainer}>
          {/* Progress Ring */}
          <View style={styles.progressRing}>
            <View 
              style={[
                styles.progressFill,
                {
                  transform: [
                    { rotate: '-90deg' },
                    { rotate: `${percentage * 3.6}deg` }
                  ]
                }
              ]} 
            />
          </View>
          
          {/* Rotating Sync Icon */}
          <Animated.View 
            style={[
              styles.syncContainer,
              { transform: [{ rotate: rotation }] }
            ]}
          >
            <Text style={styles.syncIcon}>🔄</Text>
          </Animated.View>
          
          {/* Percentage */}
          <Text style={styles.percentage}>
            {Math.round(percentage)}%
          </Text>
        </View>
        
        {/* Message */}
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 999,
  },
  backgroundBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  circleContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  progressRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressFill: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  syncContainer: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncIcon: {
    fontSize: 20,
    opacity: 0.9,
  },
  percentage: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 22, // Adjust based on your design
  },
  message: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textColor,
    textAlign: 'center',
  },
});

export default SyncProgressCircle;