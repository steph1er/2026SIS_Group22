// define type
export type Option = {
  id: string;
  label: string;
  description?: string;
};

export type SizeField = {
  id: string;
  label: string;
  options: string[];
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
  fields?: SizeField[];
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