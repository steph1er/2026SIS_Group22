import { useEffect, useState } from 'react';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import Slider from '@react-native-community/slider';

import { onboardingSteps } from './onboardingData';
import { OnboardingAnswers } from './types';

import { useTheme } from '../../hooks/use-theme';
import { Fonts, Spacing } from '../../services/theme';

export default function OnboardingQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});

  const theme = useTheme();
  const styles = createStyles(theme);

  const step = onboardingSteps[currentStep];

  const progress = (currentStep + 1) / onboardingSteps.length;
  const progressAnim = useSharedValue(progress);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  useEffect(() => {
    progressAnim.value = withTiming(progress, { duration: 350 });
  }, [progress, progressAnim]);

  const handleSelect = (
    sectionId: string,
    value: string | string[] | number
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [sectionId]: value,
    }));
  };

  const handleMultiSelect = (sectionId: string, optionId: string) => {
    const currentAnswer = answers[sectionId];

    const currentValues = Array.isArray(currentAnswer)
      ? currentAnswer
      : [];

    const newValues = currentValues.includes(optionId)
      ? currentValues.filter((id) => id !== optionId)
      : [...currentValues, optionId];

    handleSelect(sectionId, newValues);
  };

  const handleContinue = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log('Onboarding complete:', answers);

      // TODO:
      // Save onboarding answers
      // Navigate to the main app
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Overall progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[styles.progressFill, progressBarStyle]}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          {currentStep > 0 ? (
            <TouchableOpacity onPress={handleBack}>
              <Text style={styles.backButton}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}

          {currentStep === 2 && (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipButton}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Page title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{step.title}</Text>

          {step.subtitle && (
            <Text style={styles.subtitle}>{step.subtitle}</Text>
          )}
        </View>

        {/* PAGE 1, 2 & 3 */}
        {step.type !== 'wardrobe' && (
          <View style={styles.content}>
            {step.sections?.map((section) => {
              const currentAnswer = answers[section.id];

              return (
                <View key={section.id} style={styles.section}>
                  {/* Section heading */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      {section.title}
                    </Text>

                    {section.optional && (
                      <Text style={styles.optional}>
                        OPTIONAL
                      </Text>
                    )}
                  </View>

                  {section.subtitle && (
                    <Text style={styles.sectionSubtitle}>
                      {section.subtitle}
                    </Text>
                  )}

                  {/* HEIGHT SLIDER */}
                  {section.type === 'slider' && (
                    <View style={styles.sliderContainer}>
                        <Text style={styles.sliderValue}>
                        {typeof answers[section.id] === 'number'
                            ? answers[section.id]
                            : section.defaultValue ?? 168}{' '}
                        {section.unit}
                        </Text>

                        <Slider
                        style={styles.slider}
                        minimumValue={section.min ?? 140}
                        maximumValue={section.max ?? 210}
                        value={
                            typeof answers[section.id] === 'number'
                            ? answers[section.id] as number
                            : section.defaultValue ?? 168
                        }
                        step={1}
                        minimumTrackTintColor={theme.text}
                        maximumTrackTintColor={theme.backgroundSelected}
                        thumbTintColor={theme.text}
                        onValueChange={(value) =>
                            handleSelect(section.id, value)
                        }
                        />
                    </View>
                )}

                  {/* OPTIONS */}
                  {section.options && (
                    <View style={styles.optionsGrid}>
                      {section.options.map((option) => {
                        const isSelected = Array.isArray(currentAnswer)
                          ? currentAnswer.includes(option.id)
                          : currentAnswer === option.id;

                        return (
                          <TouchableOpacity
                            key={option.id}
                            style={[
                              styles.option,
                              isSelected &&
                                styles.selectedOption,
                            ]}
                            onPress={() => {
                              if (
                                section.type === 'multi-select'
                              ) {
                                handleMultiSelect(
                                  section.id,
                                  option.id
                                );
                              } else {
                                handleSelect(
                                  section.id,
                                  option.id
                                );
                              }
                            }}
                          >
                            {/* Colour circles */}
                            {section.id === 'colour' && (
                              <View
                                style={[
                                  styles.colourCircle,
                                  getColourStyle(option.id),
                                ]}
                              />
                            )}

                            <Text
                              style={[
                                styles.optionText,
                                isSelected &&
                                  styles.selectedOptionText,
                              ]}
                            >
                              {option.label}
                            </Text>

                            {option.description && (
                              <Text
                                style={[
                                  styles.optionDescription,
                                  isSelected &&
                                    styles.selectedOptionDescription,
                                ]}
                              >
                                {option.description}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* PAGE 4 — WARDROBE */}
        {step.type === 'wardrobe' && (
          <View style={styles.wardrobeContent}>
            <TouchableOpacity style={styles.wardrobeCard}>
              <Text style={styles.wardrobeIcon}>⌕</Text>

              <View style={styles.wardrobeTextContainer}>
                <Text style={styles.wardrobeTitle}>
                  Search for an item
                </Text>

                <Text style={styles.wardrobeSubtitle}>
                  Find exact brands or styles online
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.wardrobeCard}>
              <Text style={styles.wardrobeIcon}>▣</Text>

              <View style={styles.wardrobeTextContainer}>
                <Text style={styles.wardrobeTitle}>
                  Upload or take a photo
                </Text>

                <Text style={styles.wardrobeSubtitle}>
                  We'll auto-crop background instantly
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>
            {currentStep === 0 && 'Next Step'}
            {currentStep === 1 && 'Next Step'}
            {currentStep === 2 && 'Save & Next'}
            {currentStep === 3 && 'Finish Onboarding'}
          </Text>
        </TouchableOpacity>

        {currentStep === 3 && (
          <TouchableOpacity onPress={handleContinue}>
            <Text style={styles.skipForNow}>
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

function getColourStyle(colourId: string) {
  switch (colourId) {
    case 'neutrals':
      return {
        backgroundColor: '#D6D0C4',
      };

    case 'pastels':
      return {
        backgroundColor: '#E8D7E8',
      };

    case 'earth':
      return {
        backgroundColor: '#9A7355',
      };

    case 'bold':
      return {
        backgroundColor: '#E53935',
      };

    case 'mono':
      return {
        backgroundColor: '#222222',
      };

    case 'jewel':
      return {
        backgroundColor: '#5E3A7D',
      };

    default:
      return {
        backgroundColor: '#CCCCCC',
      };
  }
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    progressContainer: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
    },

    progressBackground: {
      height: 4,
      backgroundColor: theme.backgroundElement,
      borderRadius: 4,
      overflow: 'hidden',
    },

    progressFill: {
      height: 4,
      backgroundColor: theme.text,
      borderRadius: 4,
    },

    scrollContent: {
      paddingBottom: Spacing.four,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
    },

    backButton: {
      fontFamily: Fonts.sans,
      fontSize: 15,
      color: theme.textSecondary,
    },

    skipButton: {
      fontFamily: Fonts.sans,
      fontSize: 15,
      color: theme.textSecondary,
    },

    titleContainer: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.five,
      paddingBottom: Spacing.four,
    },

    title: {
      fontFamily: Fonts.sans,
      fontSize: 30,
      fontWeight: '700',
      color: theme.text,
    },

    subtitle: {
      fontFamily: Fonts.sans,
      fontSize: 15,
      color: theme.textSecondary,
      marginTop: Spacing.two,
      lineHeight: 22,
    },

    content: {
      paddingHorizontal: Spacing.four,
    },

    section: {
      marginBottom: Spacing.five,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.one,
    },

    sectionTitle: {
      fontFamily: Fonts.sans,
      fontSize: 19,
      fontWeight: '600',
      color: theme.text,
    },

    optional: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },

    sectionSubtitle: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: Spacing.two,
    },

    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },

    option: {
      width: '31.5%',
      minHeight: 48,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderRadius: Spacing.two,
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.backgroundElement,
      justifyContent: 'center',
      alignItems: 'center',
    },

    selectedOption: {
      backgroundColor: theme.backgroundSelected,
      borderColor: theme.text,
    },

    optionText: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      fontWeight: '500',
      color: theme.text,
      textAlign: 'center',
    },

    selectedOptionText: {
      color: theme.text,
      fontWeight: '600',
    },

    optionDescription: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.one,
    },

    selectedOptionDescription: {
      color: theme.textSecondary,
    },

    colourCircle: {
      width: 22,
      height: 22,
      borderRadius: 11,
      marginBottom: Spacing.one,
    },

    sliderContainer: {
      marginTop: Spacing.one,
    },

    sliderValue: {
      fontFamily: Fonts.sans,
      fontSize: 28,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.one,
    },

    slider: {
      width: '100%',
      height: 40,
    },

    wardrobeContent: {
      paddingHorizontal: Spacing.four,
      gap: Spacing.three,
    },

    wardrobeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundElement,
      borderRadius: Spacing.two,
      padding: Spacing.three,
      minHeight: 80,
    },

    wardrobeIcon: {
      fontSize: 28,
      color: theme.text,
      width: 48,
      textAlign: 'center',
    },

    wardrobeTextContainer: {
      flex: 1,
      marginLeft: Spacing.two,
    },

    wardrobeTitle: {
      fontFamily: Fonts.sans,
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },

    wardrobeSubtitle: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: Spacing.one,
    },

    footer: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.three,
      backgroundColor: theme.background,
    },

    continueButton: {
      backgroundColor: theme.text,
      paddingVertical: Spacing.three,
      borderRadius: Spacing.two,
      alignItems: 'center',
    },

    continueText: {
      fontFamily: Fonts.sans,
      color: theme.background,
      fontSize: 16,
      fontWeight: '600',
    },

    skipForNow: {
      fontFamily: Fonts.sans,
      color: theme.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginTop: Spacing.two,
    },

    placeholderText: {
      fontFamily: Fonts.sans,
      fontSize: 16,
      color: theme.textSecondary,
    },
  });