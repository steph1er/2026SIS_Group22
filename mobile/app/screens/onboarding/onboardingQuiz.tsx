import { useEffect, useRef, useState } from 'react';

import {
  Image,
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

import { useAccentColors, useTheme } from '../../hooks/use-theme';
import { Fonts, Spacing } from '../../services/theme';

import { onboardingSteps } from './onboardingData';
import { OnboardingAnswers, QuestionSection } from './types';

export default function OnboardingQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [showErrors, setShowErrors] = useState(false);
  const [openSizeField, setOpenSizeField] = useState<string | null>(null);

  const theme = useTheme();
  const accentColors = useAccentColors();
  const styles = createStyles(theme, accentColors);

  const scrollViewRef = useRef<ScrollView>(null);
  const step = onboardingSteps[currentStep];

  const progress = (currentStep + 1) / onboardingSteps.length;
  const progressAnim = useSharedValue(progress);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  useEffect(() => {
    progressAnim.value = withTiming(progress, { duration: 350 });
  }, [progress, progressAnim]);
  
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    setShowErrors(false);
    setOpenSizeField(null);
  }, [currentStep]);

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

  const handleSingleSelect = (sectionId: string, optionId: string) => {
    setAnswers((prev) => {
      if (prev[sectionId] === optionId) {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      }

      return { ...prev, [sectionId]: optionId };
    });
  };

  const handleSelectSizeField = (
    sectionId: string,
    fieldId: string,
    value: string
  ) => {
    handleSelect(`${sectionId}:${fieldId}`, value);
    setOpenSizeField(null);
  };

  const handleToggleSkipSlider = (sectionId: string) => {
    setAnswers((prev) => {
      const skipKey = `${sectionId}:skip`;
      const isSkipped = !prev[skipKey];

      const next = { ...prev, [skipKey]: isSkipped };

      if (isSkipped) {
        delete next[sectionId];
      }

      return next;
    });
  };

  const isSectionAnswered = (
    section: QuestionSection,
    answers: OnboardingAnswers
  ) => {
    if (section.type === 'slider') return true;

    if (section.fields) {
    return section.fields.every((field) => {
      const value = answers[`${section.id}:${field.id}`];
      return typeof value === 'string' && value !== '';
    });
  }

    const value = answers[section.id];

    if (Array.isArray(value)) return value.length > 0;

    return value !== undefined && value !== '';
  };

  const missingRequiredSections =
  step.sections?.filter(
    (section) => !section.optional && !isSectionAnswered(section, answers)
  ) ?? [];

  const handleContinue = () => {
    if (missingRequiredSections.length > 0) {
      setShowErrors(true);
      return;
    }
    
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
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.stepLabelRow}>
            {currentStep > 0 && (
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backChevron}
              >
                <Text style={styles.backChevronText}>‹</Text>
              </TouchableOpacity>
            )}
 
            <Text style={styles.stepLabel}>
              STEP {currentStep + 1} OF {onboardingSteps.length}
            </Text>
          </View>
 
          <Text style={styles.percentLabel}>
            {Math.round(progress * 100)}% COMPLETE
          </Text>
        </View>
 
        {/* Page title */}
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{step.title}</Text>
          </View>
 
          {step.subtitle && (
            <Text style={styles.subtitle}>{step.subtitle}</Text>
          )}
        </View>
 
        {/* PAGE 1, 2 & 3 */}
        {step.type !== 'wardrobe' && (
          <View style={styles.content}>
            {step.sections?.map((section, index) => {
              const currentAnswer = answers[section.id];
 
              const showError =
                showErrors &&
                !section.optional &&
                !isSectionAnswered(section, answers);
 
              return (
                <View key={section.id} style={styles.section}>
                  {/* Section heading */}
                  <View style={styles.sectionHeader}>
                    <Text
                      style={[
                        styles.sectionTitle,
                        showError && styles.sectionTitleError,
                      ]}
                    >
                      {index + 1}. {section.title}
                    </Text>
 
                    {section.optional && (
                      <View style={styles.optionalBadge}>
                        <Text style={styles.optionalBadgeText}>
                          OPTIONAL
                        </Text>
                      </View>
                    )}
                  </View>
 
                  {section.subtitle && (
                    <Text style={styles.sectionSubtitle}>
                      {section.subtitle}
                    </Text>
                  )}
 
                  {showError && (
                    <Text style={styles.errorText}>
                      Please make a selection to continue
                    </Text>
                  )}
 
                  {/* HEIGHT SLIDER */}
                  {section.type === 'slider' && (
                    <View style={styles.sliderContainer}>
                      {(() => {
                        const isSkipped = Boolean(
                          answers[`${section.id}:skip`]
                        );

                        return (
                          <>
                            <TouchableOpacity
                              style={styles.skipCheckboxRow}
                              onPress={() =>
                                handleToggleSkipSlider(section.id)
                              }
                            >
                              <View
                                style={[
                                  styles.checkbox,
                                  isSkipped && styles.checkboxChecked,
                                ]}
                              >
                                {isSkipped && (
                                  <Text style={styles.checkboxMark}>
                                    ✓
                                  </Text>
                                )}
                              </View>

                              <Text style={styles.skipCheckboxLabel}>
                                Prefer not to say
                              </Text>
                            </TouchableOpacity>

                            <View
                              style={
                                isSkipped && styles.sliderDisabled
                              }
                            >
                              <Text style={styles.sliderValue}>
                                {isSkipped
                                  ? 'Prefer not to say'
                                  : `${
                                      typeof answers[section.id] ===
                                      'number'
                                        ? answers[section.id]
                                        : section.defaultValue ?? 168
                                    } ${section.unit ?? ''}`}
                              </Text>

                              <Slider
                                style={styles.slider}
                                disabled={isSkipped}
                                minimumValue={section.min ?? 140}
                                maximumValue={section.max ?? 210}
                                value={
                                  typeof answers[section.id] === 'number'
                                    ? (answers[section.id] as number)
                                    : section.defaultValue ?? 168
                                }
                                step={1}
                                minimumTrackTintColor={
                                  isSkipped
                                    ? theme.backgroundSelected
                                    : theme.text
                                }
                                maximumTrackTintColor={
                                  theme.backgroundSelected
                                }
                                thumbTintColor={
                                  isSkipped
                                    ? theme.backgroundSelected
                                    : theme.text
                                }
                                onValueChange={(value) =>
                                  handleSelect(section.id, value)
                                }
                              />
                            </View>
                          </>
                        );
                      })()}
                    </View>
                )}
 
                  {/* SIZE DROPDOWNS */}
                  {section.type === 'size-select' && section.fields && (
                    <View>
                      <View style={styles.sizeFieldRow}>
                        {section.fields.map((field) => {
                          const fieldKey = `${section.id}:${field.id}`;
                          const fieldValue = answers[fieldKey];
                          const isOpen = openSizeField === fieldKey;
 
                          return (
                            <TouchableOpacity
                              key={field.id}
                              style={[
                                styles.sizeFieldBox,
                                isOpen && styles.sizeFieldBoxOpen,
                              ]}
                              onPress={() =>
                                setOpenSizeField(isOpen ? null : fieldKey)
                              }
                            >
                              <Text style={styles.sizeFieldLabel}>
                                {field.label}
                              </Text>
 
                              <View style={styles.sizeFieldValueRow}>
                                <Text style={styles.sizeFieldValue}>
                                  {typeof fieldValue === 'string'
                                    ? fieldValue
                                    : 'Select'}
                                </Text>
 
                                <Text
                                  style={[
                                    styles.sizeFieldChevron,
                                    isOpen &&
                                      styles.sizeFieldChevronOpen,
                                  ]}
                                >
                                  ▾
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
 
                      {section.fields.map((field) => {
                        const fieldKey = `${section.id}:${field.id}`;
 
                        if (openSizeField !== fieldKey) return null;
 
                        const fieldValue = answers[fieldKey];
 
                        return (
                          <View
                            key={field.id}
                            style={styles.sizeDropdownPanel}
                          >
                            <Text style={styles.sizeDropdownLabel}>
                              Select {field.label}
                            </Text>
 
                            <View style={styles.optionsGrid}>
                              {field.options.map((optionValue) => {
                                const isSelected =
                                  fieldValue === optionValue;
 
                                return (
                                  <TouchableOpacity
                                    key={optionValue}
                                    style={[
                                      styles.option,
                                      isSelected &&
                                        styles.selectedOption,
                                    ]}
                                    onPress={() =>
                                      handleSelectSizeField(
                                        section.id,
                                        field.id,
                                        optionValue
                                      )
                                    }
                                  >
                                    <Text
                                      style={[
                                        styles.optionText,
                                        isSelected &&
                                          styles.selectedOptionText,
                                      ]}
                                    >
                                      {optionValue}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
 
                                    {/* OPTIONS */}
                  {section.options && (
                    <View style={styles.optionsGrid}>
                      {section.options.map((option) => {
                        const isSelected = Array.isArray(currentAnswer)
                          ? currentAnswer.includes(option.id)
                          : currentAnswer === option.id;

                                                const isColour = section.id === 'colour';
                        const isNoGo = section.id === 'style-no-gos';
                        const isBodyType = section.id === 'body-type';
                        const isAesthetic = section.id === 'aesthetic';

                        if (isAesthetic) {
                          return (
                            <TouchableOpacity
                              key={option.id}
                              style={[
                                styles.aestheticCard,
                                isSelected &&
                                  styles.aestheticCardSelected,
                              ]}
                              onPress={() =>
                                handleSingleSelect(section.id, option.id)
                              }
                            >
                              {option.image && (
                                <Image
                                  source={{ uri: option.image }}
                                  style={styles.aestheticImage}
                                  resizeMode="cover"
                                />
                              )}

                              <View style={styles.aestheticBadge}>
                                <Text style={styles.aestheticBadgeText}>
                                  {option.label}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        }

                        if (isBodyType) {
                          return (
                            <TouchableOpacity
                              key={option.id}
                              style={[
                                styles.bodyTypeCard,
                                isSelected &&
                                  styles.bodyTypeCardSelected,
                              ]}
                              onPress={() =>
                                handleSingleSelect(section.id, option.id)
                              }
                            >
                              <Text style={styles.bodyTypeIcon}>
                                {getBodyTypeIcon(option.id)}
                              </Text>

                              <Text style={styles.bodyTypeTitle}>
                                {option.label}
                              </Text>

                              {option.description && (
                                <Text style={styles.bodyTypeDescription}>
                                  {option.description}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        }

                        return (
                          <TouchableOpacity
                            key={option.id}
                            style={[
                              isColour ? styles.colourItem : styles.option,
                              !isColour &&
                                isSelected &&
                                styles.selectedOption,
                              isNoGo && styles.noGoOption,
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
                                handleSingleSelect(
                                  section.id,
                                  option.id
                                );
                              }
                            }}
                          >
                            {/* Colour circles */}
                            {isColour && (
                              <View
                                style={[
                                  styles.colourCircle,
                                  getColourStyle(option.id),
                                  isSelected &&
                                    styles.colourCircleSelected,
                                ]}
                              />
                            )}

                            <Text
                              style={[
                                isColour
                                  ? styles.colourLabel
                                  : styles.optionText,
                                !isColour &&
                                  isSelected &&
                                  styles.selectedOptionText,
                              ]}
                            >
                              {option.label}
                            </Text>

                            {isNoGo && isSelected && (
                              <Text style={styles.noGoRemove}>✕</Text>
                            )}

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
              <View style={styles.wardrobeIconBox}>
                <Text style={styles.wardrobeIcon}>⌕</Text>
              </View>
 
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
              <View style={styles.wardrobeIconBox}>
                <Text style={styles.wardrobeIcon}>▣</Text>
              </View>
 
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
        {showErrors && missingRequiredSections.length > 0 && (
          <Text style={styles.footerErrorText}>
            {missingRequiredSections.length === 1
              ? 'Please answer the required question above.'
              : 'Please answer all required questions above.'}
          </Text>
        )}
 
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

function getBodyTypeIcon(bodyTypeId: string) {
  switch (bodyTypeId) {
    case 'hourglass':
      return '⏳';
    case 'rectangle':
      return '▭';
    case 'pear':
      return '🍐';
    case 'apple':
      return '🍎';
    case 'inverted-triangle':
      return '▽';
    default:
      return '●';
  }
}
 
const createStyles = (
  theme: ReturnType<typeof useTheme>,
  accentColors: ReturnType<typeof useAccentColors>
) =>
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
      backgroundColor: accentColors.track,
      borderRadius: 4,
      overflow: 'hidden',
    },
 
    progressFill: {
      height: 4,
      backgroundColor: accentColors.primary,
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
 
    stepLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
 
    backChevron: {
      paddingRight: Spacing.one,
    },
 
    backChevronText: {
      fontSize: 20,
      color: theme.textSecondary,
      lineHeight: 20,
    },
 
    stepLabel: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '600',
      color: theme.textSecondary,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
 
    percentLabel: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '700',
      color: theme.text,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
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
 
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
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
 
    optionalBadge: {
      backgroundColor: accentColors.badgeBg,
      borderRadius: 20,
      paddingHorizontal: Spacing.two,
      paddingVertical: 3,
    },
 
    optionalBadgeText: {
      fontFamily: Fonts.sans,
      fontSize: 10,
      fontWeight: '600',
      color: accentColors.badgeText,
      letterSpacing: 0.5,
    },
 
    sectionTitleError: {
      color: accentColors.errorRed,
    },
 
    errorText: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      color: accentColors.errorRed,
      marginBottom: Spacing.two,
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
      minHeight: 40,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      borderRadius: 24,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor:  accentColors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
 
    selectedOption: {
      backgroundColor: accentColors.chipSelectedBg,
      borderColor: accentColors.primary,
    },
 
    optionText: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      fontWeight: '500',
      color: theme.textSecondary,
      textAlign: 'center',
    },
 
    selectedOptionText: {
      color: theme.text,
      fontWeight: '700',
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
 
    colourItem: {
      alignItems: 'center',
      width: 64,
    },

    colourCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginBottom: Spacing.one,
      borderWidth: 2,
      borderColor: 'transparent',
    },

    colourCircleSelected: {
      borderColor: accentColors.primary,
    },

    colourLabel: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
    },

    noGoOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    noGoRemove: {
      fontSize: 12,
      fontWeight: '700',
      color: accentColors.errorRed,
    },

        bodyTypeCard: {
      width: '31%',
      minHeight: 92,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderRadius: Spacing.two,
      backgroundColor: theme.backgroundElement,
      borderWidth: 1,
      borderColor: theme.backgroundElement,
      alignItems: 'flex-start',
    },

    bodyTypeCardSelected: {
      backgroundColor:  accentColors.chipSelectedBg,
      borderColor: accentColors.primary,
    },

    bodyTypeIcon: {
      fontSize: 20,
      marginBottom: Spacing.one,
    },

    bodyTypeTitle: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },

    bodyTypeDescription: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      color: theme.textSecondary,
    },

        aestheticCard: {
      width: '31%',
      aspectRatio: 0.75,
      borderRadius: Spacing.two,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
      backgroundColor: theme.backgroundElement,
      position: 'relative',
    },

    aestheticCardSelected: {
      borderColor: accentColors.primary,
    },

    aestheticImage: {
      width: '100%',
      height: '100%',
    },

    aestheticBadge: {
      position: 'absolute',
      top: Spacing.one,
      left: Spacing.one,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      paddingHorizontal: Spacing.two,
      paddingVertical: 3,
    },

    aestheticBadgeText: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      fontWeight: '700',
      color: '#1A1A1A',
    },

    sliderContainer: {
      marginTop: Spacing.one,
    },

    skipCheckboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.two,
    },

    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: theme.textSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.two,
    },

    checkboxChecked: {
      backgroundColor: accentColors.primary,
      borderColor: accentColors.primary,
    },

    checkboxMark: {
      color: accentColors.buttonText,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 13,
    },

    skipCheckboxLabel: {
      fontFamily: Fonts.sans,
      fontSize: 14,
      color: theme.textSecondary,
    },

    sliderDisabled: {
      opacity: 0.4,
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
 
    sizeFieldRow: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
 
    sizeFieldBox: {
      flex: 1,
      backgroundColor: theme.backgroundElement,
      borderRadius: Spacing.two,
      borderWidth: 1,
      borderColor: theme.backgroundElement,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
    },
 
    sizeFieldBoxOpen: {
      borderColor: accentColors.primary,
      backgroundColor: accentColors.chipSelectedBg,
    },
 
    sizeFieldLabel: {
      fontFamily: Fonts.sans,
      fontSize: 11,
      color: theme.textSecondary,
      marginBottom: 2,
    },
 
    sizeFieldValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
 
    sizeFieldValue: {
      fontFamily: Fonts.sans,
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
    },
 
    sizeFieldChevron: {
      fontSize: 14,
      color: theme.textSecondary,
    },
 
    sizeFieldChevronOpen: {
      color: accentColors.primary,
    },
 
    sizeDropdownPanel: {
      marginTop: Spacing.two,
      padding: Spacing.two,
      backgroundColor: theme.backgroundElement,
      borderRadius: Spacing.two,
    },
 
    sizeDropdownLabel: {
      fontFamily: Fonts.sans,
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: Spacing.two,
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
 
    wardrobeIconBox: {
      width: 48,
      height: 48,
      borderRadius: Spacing.two,
      backgroundColor: accentColors.chipSelectedBg,
      justifyContent: 'center',
      alignItems: 'center',
    },

    wardrobeIcon: {
      fontSize: 22,
      color: accentColors.primary,
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
 
    footerErrorText: {
      fontFamily: Fonts.sans,
      fontSize: 13,
      color: accentColors.errorRed,
      textAlign: 'center',
      marginBottom: Spacing.two,
    },
 
    continueButton: {
      backgroundColor: accentColors.primary,
      paddingVertical: Spacing.three,
      borderRadius: 24,
      alignItems: 'center',
    },
 
    continueText: {
      fontFamily: Fonts.sans,
      color: accentColors.buttonText,
      fontSize: 16,
      fontWeight: '700',
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