import { router } from 'expo-router';

import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming, } from 'react-native-reanimated';

import { useAuth } from '../../../src/auth/auth-provider';
import { completeOnboarding } from '../../../src/onboarding/onboarding-service';
import { onboardingSteps } from './onboardingData';
import { OnboardingAnswers, QuestionSection } from './onboardingTypes';

export function useOnboardingHandler() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [showErrors, setShowErrors] = useState(false);
  const [openSizeField, setOpenSizeField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  // A ref, not just state, so a rapid second tap is blocked before React re-renders.
  const isSavingRef = useRef(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const step = onboardingSteps[currentStep];

  const progress = (currentStep + 1) / onboardingSteps.length;
  const progressAnim = useSharedValue(progress);
  const progressBarStyle = useAnimatedStyle(() => ({ width: `${progressAnim.value * 100}%` }));

  useEffect(() => {
    progressAnim.value = withTiming(progress, { duration: 350 });
  }, [progress, progressAnim]);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    setShowErrors(false);
    setOpenSizeField(null);
  }, [currentStep]);

  const handleSelect = ( sectionId: string, value: string | string[] | number ) => {
    setAnswers((prev) => ({ ...prev, [sectionId]: value }));
  };

  const handleMultiSelect = (sectionId: string, optionId: string) => {
    const currentAnswer = answers[sectionId];
    const currentValues = Array.isArray(currentAnswer) ? currentAnswer : [];
    const newValues = currentValues.includes(optionId) ? currentValues.filter((id) => id !== optionId) : [...currentValues, optionId];

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

  const handleSelectSizeField = ( sectionId: string, fieldId: string, value: string ) => {
      const key = `${sectionId}:${fieldId}`;
      setAnswers((prev) => {
        if (prev[key] === value) {
          const next = { ...prev };
          delete next[key];
          return next;
        }

        return { ...prev, [key]: value };
      });
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

  const handleChangePriceRange = ( sectionId: string, fieldId: string, min: number, max: number ) => {
    const key = `${sectionId}:${fieldId}`;
    setAnswers((prev) => ({ ...prev, [`${key}:min`]: min, [`${key}:max`]: max, [`${sectionId}:anyPrice`]: false }));
  };

  const handleTogglePriceSkip = (sectionId: string, fieldId: string) => {
    const key = `${sectionId}:${fieldId}`;
    setAnswers((prev) => {
      const skipKey = `${key}:skip`;
      const isSkipped = !prev[skipKey];
      const next = { ...prev, [skipKey]: isSkipped, [`${sectionId}:anyPrice`]: false };

      if (isSkipped) {
        delete next[`${key}:min`];
        delete next[`${key}:max`];
      }

      return next;
    });
  };

  const handleToggleAnyPrice = (sectionId: string, priceFields: { id: string; min: number; max: number }[]) => {
    setAnswers((prev) => {
      const key = `${sectionId}:anyPrice`;
      const isCurrentlyAnyPrice = Boolean(prev[key]);
      const updated = {...prev, [key]: !isCurrentlyAnyPrice};

      priceFields.forEach((field) => {
        const fieldKey = `${sectionId}:${field.id}`;
        if (!isCurrentlyAnyPrice) {
          updated[`${fieldKey}:skip`] = false;
          updated[`${fieldKey}:min`] = field.min;
          updated[`${fieldKey}:max`] = field.max;
        } else {
          delete updated[`${fieldKey}:skip`];
          delete updated[`${fieldKey}:min`];
          delete updated[`${fieldKey}:max`];
        }
      });

      return updated;
    });
  };

  const handleToggleSkipAllPrices = (sectionId: string, priceFields: { id: string; min: number; max: number }[]) => {
    setAnswers((prev) => {
      const isCurrentlySkipAll = priceFields.every((field) => {
        const key = `${sectionId}:${field.id}`;
        return Boolean(prev[`${key}:skip`]);
      });

      const updated = { ...prev , [`${sectionId}:anyPrice`]: false };
      priceFields.forEach((field) => {
        const key = `${sectionId}:${field.id}`;
        const willSkip = !isCurrentlySkipAll;
        updated[`${key}:skip`] = willSkip;

        if (willSkip) {
          delete updated[`${key}:min`];
          delete updated[`${key}:max`];
        }
      });

      return updated;
    });
  };

  const isSectionAnswered = ( section: QuestionSection, answers: OnboardingAnswers ) => {
    if (section.type === 'slider') {
      const hasValue = typeof answers[section.id] === 'number';
      const isSkipped = Boolean(answers[`${section.id}:skip`]);
      return hasValue || isSkipped;
    }

    if (section.type === 'price-select' && section.priceFields) {
      return section.priceFields.every((field) => {
        const key = `${section.id}:${field.id}`;
        const isSkipped = Boolean(answers[`${key}:skip`]);
        if (isSkipped) return true;

        const minVal = answers[`${key}:min`];
        const maxVal = answers[`${key}:max`];
        return typeof minVal === 'number' && typeof maxVal === 'number';
      });
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

  const missingRequiredSections = step.sections?.filter((section) => !section.optional && !isSectionAnswered(section, answers)) ?? [];

  // Runs for both "Finish Onboarding" and "Skip for now". Skipping only skips
  // adding wardrobe items, so the answers are still saved and onboarding is completed.
  const finishOnboarding = async () => {
    if (isSavingRef.current) return;

    if (!user) {
      setSaveError('You need to be signed in to save your answers. Please log in and try again.');
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setSaveError('');

    try {
      // Saves the answers first, then marks the profile completed. Throws if either fails.
      await completeOnboarding(user.id, answers);
    } catch (error) {
      console.error('Unable to finish onboarding:', error);
      setSaveError("We couldn't save your answers. Please check your connection and try again.");
      isSavingRef.current = false;
      setIsSaving(false);
      return;
    }

    // Saved and marked complete. The buttons stay disabled while navigating away.
    router.replace('/home-dashboard');
  };

  const handleContinue = () => {
    if (isSavingRef.current) return;

    if (missingRequiredSections.length > 0) {
      setShowErrors(true);
      return;
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      void finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return {
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
  };
}