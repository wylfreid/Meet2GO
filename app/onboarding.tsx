import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useOnboarding } from '@/contexts/OnboardingContext';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: 'slide1',
    title: 'Bienvenue sur Meet2Go',
    text: 'Trouvez ou proposez un trajet en quelques secondes, partout au Cameroun.',
    image: require('../assets/images/illustration1.png'), // Remplace par tes propres images
  },
  {
    key: 'slide2',
    title: 'Réservez en toute confiance',
    text: 'Des profils vérifiés, des paiements sécurisés et un support réactif.',
    image: require('../assets/images/illustration2.png'),
  },
  {
    key: 'slide3',
    title: 'Voyagez malin',
    text: 'Économisez, rencontrez, partagez. Prêt à rejoindre la communauté ?',
    image: require('../assets/images/illustration3.png'),
  },
];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useRef<ScrollView>(null);
  const [current, setCurrent] = useState(0);
  const { setOnboardingComplete, setTransitioning } = useOnboarding();

  const handleNext = async () => {
    if (current < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (current + 1), animated: true });
    } else {
      // Marquer l'onboarding comme terminé via le contexte
      try {
        setTransitioning(true);
        await setOnboardingComplete(true);
        console.log('✅ Onboarding terminé, navigation vers login');
        router.replace('/login');
        setTimeout(() => setTransitioning(false), 500);
      } catch (error) {
        setTransitioning(false);
        console.error('Error saving onboarding status:', error);
        router.replace('/login');
      }
    }
  };

  const onScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrent(slideIndex);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>  
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {slides.map((slide, idx) => (
          <View key={slide.key} style={[styles.slide, { width }]}> 
            <Image source={slide.image} style={styles.image} resizeMode="contain" />
            <ThemedText style={styles.title}>{slide.title}</ThemedText>
            <ThemedText style={styles.text}>{slide.text}</ThemedText>
          </View>
        ))}
      </ScrollView>
      <ThemedView style={styles.footer}>
        <View style={styles.dotsContainer}>
          {slides.map((_, idx) => (
            <View
              key={idx}
              style={[styles.dot, current === idx && { backgroundColor: Colors[colorScheme].tint }]}
            />
          ))}
        </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: Colors[colorScheme].tint }]} onPress={handleNext}>
          <ThemedText style={styles.buttonText}>{current === slides.length - 1 ? 'Commencer' : 'Suivant'}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  image: {
    width: '100%',
    height: 220,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 