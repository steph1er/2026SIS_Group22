import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming, } from 'react-native-reanimated';

import { onboardingSteps } from './onboardingData';
import { OnboardingAnswers, QuestionSection } from './types';

export function useOnboardingHandler() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [showErrors, setShowErrors] = useState(false);
  const [openSizeField, setOpenSizeField] = useState<string | null>(null);

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
    if (section.type === 'slider') {
      const hasValue = typeof answers[section.id] === 'number';
      const isSkipped = Boolean(answers[`${section.id}:skip`]);
      return hasValue || isSkipped;
    }

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

  return {
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
    isSectionAnswered,
    handleContinue,
    handleBack,
  };
}