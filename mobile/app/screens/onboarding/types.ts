// define type
export type Option = {
  id: string;
  label: string;
  description?: string;
};

export type QuestionSection = {
  id: string;
  title: string;
  subtitle?: string;
  type:
    | 'multi-select'
    | 'single-select'
    | 'image-select'
    | 'slider'
    | 'size-select';
  optional?: boolean;
  options?: Option[];
  min?: number;
  max?: number;
  defaultValue?: number;
  unit?: string;
};

export type OnboardingStep = {
  id: string;
  title: string;
  subtitle?: string;
  sections?: QuestionSection[];
  type?: 'questions' | 'wardrobe';
};

export type OnboardingAnswers = Record<
  string,
  string[] | string | number
>;