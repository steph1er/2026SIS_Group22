import Slider from '@react-native-community/slider';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import RangeSlider from 'react-native-fast-range-slider';
import Animated from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { onboardingSteps } from './onboardingData';

import { inputStyles } from '../../services/onboarding/onboarding-inputs';
import { optionStyles } from '../../services/onboarding/onboarding-options';
import { layoutStyles } from '../../services/onboarding/onboarding-theme';
import { wardrobeStyles } from '../../services/onboarding/onboarding-wardrobe';
import { StyleUTokens } from '../../services/styleu-theme';
import { useAuth } from '../../../src/auth/auth-provider';
import { useOnboardingHandler } from './onboardingHandler';

const styles = { ...layoutStyles, ...optionStyles, ...inputStyles, ...wardrobeStyles };
const defaultPriceSliderWidth = 280;
const minPriceSliderWidth = 120;
const priceSliderLayoutPadding = 40;
const priceThumbSize = 18;
const priceLabelWidth = 40;

export default function OnboardingQuiz() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    isSaving,
    saveError,
    currentStep,
    answers,
    showErrors,
    openSizeField,
    setOpenSizeField,
    scrollViewRef,
    step,
    progress,
    progressBarStyle,
    missingRequiredSections,
    handleSelect,
    handleMultiSelect,
    handleSingleSelect,
    handleSelectSizeField,
    handleToggleSkipSlider,
    handleChangePriceRange,
    handleTogglePriceSkip,
    handleToggleAnyPrice,
    handleToggleSkipAllPrices,
    isSectionAnswered,
    handleContinue,
    handleBack,
  } = useOnboardingHandler();

  const [priceSliderWidth, setPriceSliderWidth] = useState(defaultPriceSliderWidth);
  const [livePriceValues, setLivePriceValues] = useState<Record<string, [number, number]>>({});

  // Onboarding answers are saved against the signed-in user, so there is nothing to do without one.
  if (isAuthLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={StyleUTokens.colors.accent} size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>

        {/* header */}

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View style={[styles.progressFill, progressBarStyle]} />
          </View>
        </View>

        <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.stepLabelRow}>
              {currentStep > 0 && (
                <TouchableOpacity onPress={handleBack} style={styles.backChevron}>
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

          {/* step */}

          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{step.title}</Text>
            </View>
            {step.subtitle && (<Text style={styles.subtitle}>{step.subtitle}</Text>)}
          </View>

          {/* steps exc. final */}

          {step.type !== 'wardrobe' && (
            <View style={styles.content}>
              {step.sections?.map((section, index) => {
                const currentAnswer = answers[section.id];
                const showError = showErrors && !section.optional && !isSectionAnswered(section, answers);

                const isAnyPrice = (section.type === 'price-select' && Boolean(answers[`${section.id}:anyPrice`]));
                const isSkipAll =
                  section.type === 'price-select' &&
                  section.priceFields?.every((field) => {
                    const fieldKey = `${section.id}:${field.id}`;
                    return Boolean(answers[`${fieldKey}:skip`]);
                  });

                return (
                  <View key={section.id} style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, showError && styles.sectionTitleError]}>
                        {section.title}
                      </Text>

                      {/* optional, subtitle and error display */}

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

                    {/* height */}

                    {section.type === 'slider' && (
                      <View style={styles.sliderContainer}>
                        {(() => {
                          const isSkipped = Boolean( answers[`${section.id}:skip`] );

                          return (
                            <>
                              <TouchableOpacity style={styles.skipCheckboxRow} onPress={() => handleToggleSkipSlider(section.id) }>
                                <View style={[  styles.checkbox, isSkipped && styles.checkboxChecked ]} >
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

                              <View style={ isSkipped && styles.sliderDisabled }>
                                <Text style={styles.sliderValue}>
                                  {typeof answers[section.id] === 'number' ? answers[section.id] : section.defaultValue} {section.unit}
                                </Text>

                                <Slider
                                  style={styles.slider}
                                  disabled={isSkipped}
                                  minimumValue={section.min}
                                  maximumValue={section.max}
                                  value={typeof answers[section.id] === 'number' ? (answers[section.id] as number) : section.defaultValue}
                                  step={1}
                                  minimumTrackTintColor={isSkipped ? StyleUTokens.colors.placeholder : StyleUTokens.colors.text}
                                  maximumTrackTintColor={StyleUTokens.colors.placeholder}
                                  thumbTintColor={isSkipped ? StyleUTokens.colors.placeholder : StyleUTokens.colors.text}
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

                  {/* size selection */}

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
                                  {typeof fieldValue === 'string' ? fieldValue : 'Select'}
                                </Text>

                                <Text style={[styles.sizeFieldChevron, isOpen && styles.sizeFieldChevronOpen]}>
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
                          <View key={field.id} style={styles.sizeDropdownPanel}>
                            <Text style={styles.sizeDropdownLabel}>
                              Select {field.label}
                            </Text>

                            <View style={styles.optionsGrid}>
                              {field.options.map((optionValue) => {
                                const isSelected = fieldValue === optionValue;

                                return (
                                  <TouchableOpacity
                                    key={optionValue}
                                    style={[
                                      styles.option,
                                      isSelected &&
                                        styles.selectedOption,
                                    ]}
                                    onPress={() =>
                                      handleSelectSizeField(section.id, field.id, optionValue)
                                    }
                                  >
                                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
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

                  {/* price range */}

                  {section.type === 'price-select' && section.priceFields && (
                    <View style={styles.priceFieldsList}>
                      <View style={styles.priceCategoryActions}>
                        <TouchableOpacity
                          style={styles.priceCategoryAction}
                          onPress={() => handleToggleAnyPrice(section.id, section.priceFields!)}
                        >
                          <View style={[styles.checkbox, isAnyPrice && styles.checkboxChecked]}>
                            {isAnyPrice && (
                              <Text style={styles.checkboxMark}>✓</Text>
                            )}
                          </View>

                          <Text style={styles.priceCategoryActionText}>
                            Any price
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.priceCategoryAction}
                          onPress={() => handleToggleSkipAllPrices(section.id, section.priceFields!)}
                        >
                          <View style={[styles.checkbox, isSkipAll && styles.checkboxChecked]}>
                            {isSkipAll && (
                              <Text style={styles.checkboxMark}>✓</Text>
                            )}
                          </View>

                          <Text style={styles.priceCategoryActionText}>
                            Skip all
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {section.priceFields.map((field) => {
                        const fieldKey = `${section.id}:${field.id}`;
                        const isSkipped = Boolean(answers[`${fieldKey}:skip`]);
                        const storedMin = answers[`${fieldKey}:min`];
                        const storedMax = answers[`${fieldKey}:max`];
                        const liveValue = livePriceValues[fieldKey];

                        const minVal = liveValue
                          ? liveValue[0]
                          : typeof storedMin === 'number' ? storedMin : field.min;
                        const maxVal = liveValue
                          ? liveValue[1]
                          : typeof storedMax === 'number' ? storedMax : field.max;

                        const travel = Math.max(priceSliderWidth - priceThumbSize, 0);
                        const labelLeft = (value: number) =>
                          priceThumbSize / 2 + ((value - field.min) / (field.max - field.min)) * travel - priceLabelWidth / 2;

                        return (
                          <View key={field.id} style={styles.priceCard}>
                            <View style={styles.priceCardHeader}>
                              <Text style={styles.priceCardTitle}>{field.label}</Text>

                              <TouchableOpacity
                                style={styles.priceCardSkipRow}
                                onPress={() => handleTogglePriceSkip(section.id, field.id)}
                              >
                                <View style={[styles.checkbox, isSkipped && styles.checkboxChecked]}>
                                  {isSkipped && <Text style={styles.checkboxMark}>✓</Text>}
                                </View>
                                <Text style={styles.skipCheckboxLabel}>Skip</Text>
                              </TouchableOpacity>
                            </View>

                            <View style={isSkipped && styles.sliderDisabled}>
                              <View
                                style={styles.priceSliderContainer}
                                onLayout={(e) =>
                                  setPriceSliderWidth(Math.max(e.nativeEvent.layout.width - priceSliderLayoutPadding, minPriceSliderWidth))
                                }
                              >
                                <Text style={[styles.priceValue, {left: labelLeft(minVal)}]}>
                                  ${minVal}
                                </Text>

                                <Text style={[styles.priceValue, {left:labelLeft(maxVal)}]}>
                                  ${maxVal}
                                </Text>

                                <RangeSlider
                                  key={`${fieldKey}-${priceSliderWidth}`}
                                  min={field.min}
                                  max={field.max}
                                  step={field.step ?? 1}
                                  initialMinValue={minVal}
                                  initialMaxValue={maxVal}
                                  width={priceSliderWidth}
                                  enabled={!isSkipped}
                                  selectedTrackColor={StyleUTokens.colors.text}
                                  onValuesChange={([low, high]) =>
                                    setLivePriceValues((prev) => ({ ...prev, [fieldKey]: [low, high] }))
                                  }
                                  onValuesChangeFinish={([low, high]) => {
                                    handleChangePriceRange(section.id, field.id, low, high);
                                    setLivePriceValues((prev) => {
                                      const next = { ...prev };
                                      delete next[fieldKey];
                                      return next;
                                    });
                                  }}
                                  thumbSize={priceThumbSize}
                                  showThumbLines={false}
                                />
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  {/* qs with 'options' data */}

                  {section.options && (
                    <View style={styles.optionsGrid}>
                      {section.options.map((option) => {
                        const isSelected = Array.isArray(currentAnswer)
                          ? currentAnswer.includes(option.id)
                          : currentAnswer === option.id;
                        const isColour = section.id === 'colour';
                        const isBodyType = section.id === 'body-type';
                        const isAesthetic = section.id === 'aesthetic';

                        // aesthetic cards
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
                                  source={typeof option.image === 'number' ? option.image : { uri: option.image }}
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

                        // body type cards
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
                              !isColour && isSelected && styles.selectedOption,
                              section.type === 'multi-select' && !isColour && styles.multiSelectOption,
                            ]}
                            onPress={() => {
                              if(section.type === 'multi-select'){
                                handleMultiSelect(section.id, option.id);
                              } else {
                                handleSingleSelect(section.id, option.id);
                              }
                            }}
                          >

                            {isColour && (
                              <View
                                style={[
                                  styles.colourCircle,
                                  { backgroundColor: option.colour },
                                  isSelected && styles.colourCircleSelected,
                                ]}
                              />
                            )}

                            <Text
                              style={[
                                isColour ? styles.colourLabel : styles.optionText,
                                !isColour && isSelected && styles.selectedOptionText,
                              ]}
                            >
                              {option.label}
                            </Text>

                            {section.type === 'multi-select' && !isColour && isSelected && (
                              <Text style={styles.removeIcon}>
                                ✕
                              </Text>
                            )}

                            {option.description && (
                              <Text
                                style={[
                                  styles.optionDescription,
                                  isSelected && styles.selectedOptionDescription,
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

        {/* final step */}

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
                  Begin building your digital wardrobe with your own items!
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* footer */}

      <View style={styles.footer}>
        {showErrors && missingRequiredSections.length > 0 && (
          <Text style={styles.footerErrorText}>
              Please answer all the required questions above.
          </Text>
        )}

        {saveError !== '' && (
          <Text accessibilityRole="alert" style={styles.footerErrorText}>
            {saveError}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.continueButton, isSaving && { opacity: 0.6 }]}
          onPress={handleContinue}
          disabled={isSaving}
        >
          <Text style={styles.continueText}>
            {currentStep < onboardingSteps.length - 2 && 'Next Step'}
            {currentStep === onboardingSteps.length - 2 && 'Save & Next'}
            {currentStep === onboardingSteps.length - 1 && (isSaving ? 'Saving…' : 'Finish Onboarding')}
          </Text>
        </TouchableOpacity>

        {currentStep === onboardingSteps.length - 1 && (
          <TouchableOpacity onPress={handleContinue} disabled={isSaving}>
            <Text style={styles.skipForNow}>
              Skip for now
            </Text>
          </TouchableOpacity>
        )}
      </View>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}