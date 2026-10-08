import { router } from 'expo-router';

import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming, } from 'react-native-reanimated';

import { useAuth } from '../../../src/auth/auth-provider';
import {
  completeOnboarding,
  type OnboardingProgress,
  saveOnboardingProgress,
} from '../../../src/onboarding/onboarding-service';
import { onboardingSteps } from './onboardingData';
import { OnboardingAnswers, QuestionSection } from './onboardingTypes';

export function useOnboardingHandler(initial: OnboardingProgress) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(initial.initialStep);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initial.initialAnswers);
  // The furthest screen reached. It only ever goes up, so going Back to edit an
  // earlier screen never lowers the saved progress.
  const [furthestStep, setFurthestStep] = useState(initial.initialStep);
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

  // Runs one save for the signed-in user, blocking a second tap while it is in flight.
  // Returns true when it succeeded. On success the saving state is left on, so the
  // caller decides when the buttons come back; on failure it is cleared here and an
  // inline error is shown, so the user stays on this screen and can retry.
  const runSave = async (errorMessage: string, save: (userId: string) => Promise<void>) => {
    if (isSavingRef.current) return false;

    if (!user) {
      setSaveError('You need to be signed in to save your answers. Please log in and try again.');
      return false;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setSaveError('');

    try {
      await save(user.id);
      return true;
    } catch (error) {
      console.error('Unable to save onboarding:', error);
      setSaveError(errorMessage);
      isSavingRef.current = false;
      setIsSaving(false);
      return false;
    }
  };

  // Runs for both "Finish Onboarding" and "Skip for now". Skipping only skips
  // adding wardrobe items, so the answers are still saved and onboarding is completed.
  const finishOnboarding = async () => {
    // Saves the answers and progress first, then marks the profile completed. If either
    // fails we stay here, and the saved progress lets the user resume from this screen.
    const saved = await runSave("We couldn't save your answers. Please check your connection and try again.", (userId) =>
      completeOnboarding(userId, answers, Math.max(furthestStep, currentStep)),
    );

    // Saved and marked complete. The buttons stay disabled while navigating away.
    if (saved) router.replace('/home-dashboard');
  };

  // Move to the next screen. For an unfinished user the answers and progress are saved first,
  // and the screen only changes once that save succeeds.
  const goToNextStep = async () => {
    const nextStep = currentStep + 1;
    const reachedStep = Math.max(furthestStep, nextStep);

    if (initial.persistProgress) {
      const saved = await runSave("We couldn't save your progress. Please check your connection and try again.", (userId) =>
        saveOnboardingProgress(userId, answers, reachedStep),
      );
      if (!saved) return;

      isSavingRef.current = false;
      setIsSaving(false);
    }

    setFurthestStep(reachedStep);
    setCurrentStep(nextStep);
  };

  const handleContinue = () => {
    if (isSavingRef.current) return;

    if (missingRequiredSections.length > 0) {
      setShowErrors(true);
      return;
    }

    if (currentStep < onboardingSteps.length - 1) {
      void goToNextStep();
    } else {
      void finishOnboarding();
    }
  };

  const handleBack = () => {
    if (isSavingRef.current) return;

    if (currentStep > 0) {
      setSaveError('');
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