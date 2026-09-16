import { OnboardingStep } from './types';

export const onboardingSteps: OnboardingStep[] = [
  // --------------------------------------------------
  // STEP 1 — STYLE
  // --------------------------------------------------
  {
    id: 'style',
    title: 'Select Your Style',
    subtitle: 'Tell us a little about your personal style.',
    sections: [
      {
        id: 'aesthetic',
        title: 'Select Your Aesthetic',
        subtitle: 'Choose the core vibe you align with most',
        type: 'image-select',
        options: [
          {
            id: 'y2k',
            label: 'Y2K',
          },
          {
            id: 'classy',
            label: 'Classy',
          },
          {
            id: 'casual',
            label: 'Casual',
          },
        ],
      },

      {
        id: 'style-keywords',
        title: 'Style Keywords',
        type: 'multi-select',
        options: [
          {
            id: 'minimalist',
            label: 'Minimalist',
          },
          {
            id: 'streetwear',
            label: 'Streetwear',
          },
          {
            id: 'cottagecore',
            label: 'Cottagecore',
          },
          {
            id: 'dark-academia',
            label: 'Dark Academia',
          },
          {
            id: 'coquette',
            label: 'Coquette',
          },
          {
            id: 'bohemian',
            label: 'Bohemian',
          },
          {
            id: 'preppy',
            label: 'Preppy',
          },
          {
            id: 'grunge',
            label: 'Grunge',
          },
          {
            id: 'athleisure',
            label: 'Athleisure',
          },
          {
            id: 'old-money',
            label: 'Old Money',
          },
          {
            id: 'avant-garde',
            label: 'Avant-Garde',
          },
          {
            id: 'romantic',
            label: 'Romantic',
          },
          {
            id: 'edgy',
            label: 'Edgy',
          },
          {
            id: 'retro',
            label: 'Retro',
          },
        ],
      },
    ],
  },

  // --------------------------------------------------
  // STEP 2 — CLOTHING PREFERENCES
  // --------------------------------------------------
  {
    id: 'clothing-preferences',
    title: 'Clothing Preferences',
    subtitle: 'Help us understand what you like to wear.',
    sections: [
      {
        id: 'colour',
        title: 'Colour',
        subtitle: 'Select palettes you love to wear',
        type: 'multi-select',
        options: [
          {
            id: 'neutrals',
            label: 'Neutrals',
          },
          {
            id: 'pastels',
            label: 'Pastels',
          },
          {
            id: 'earth',
            label: 'Earth',
          },
          {
            id: 'bold',
            label: 'Bold',
          },
          {
            id: 'mono',
            label: 'Mono',
          },
          {
            id: 'jewel',
            label: 'Jewel',
          },
        ],
      },

      {
        id: 'fit',
        title: 'Fit',
        type: 'multi-select',
        options: [
          {
            id: 'oversized',
            label: 'Oversized',
          },
          {
            id: 'relaxed',
            label: 'Relaxed',
          },
          {
            id: 'regular',
            label: 'Regular',
          },
          {
            id: 'slim',
            label: 'Slim',
          },
          {
            id: 'tailored',
            label: 'Tailored',
          },
        ],
      },

      {
        id: 'fashion-outlook',
        title: 'Fashion Outlook',
        type: 'multi-select',
        options: [
          {
            id: 'classic',
            label: 'Classic',
          },
          {
            id: 'trendy',
            label: 'Trendy',
          },
          {
            id: 'experimental',
            label: 'Experimental',
          },
          {
            id: 'timeless',
            label: 'Timeless',
          },
          {
            id: 'eclectic',
            label: 'Eclectic',
          },
        ],
      },

      {
        id: 'style-no-gos',
        title: 'Style No-Gos',
        subtitle: "We'll filter out items containing these",
        type: 'multi-select',
        options: [
          {
            id: 'animal-print',
            label: 'Animal Print',
          },
          {
            id: 'neon',
            label: 'Neon Colors',
          },
          {
            id: 'heavy-logos',
            label: 'Heavy Logos',
          },
          {
            id: 'crop-tops',
            label: 'Crop Tops',
          },
          {
            id: 'low-rise',
            label: 'Low-rise',
          },
        ],
      },
    ],
  },

  // --------------------------------------------------
  // STEP 3 — PERSONAL FIT
  // --------------------------------------------------
  {
    id: 'personal-fit',
    title: 'Personal Fit',
    subtitle: 'Optional details to improve your recommendations.',
    sections: [
      {
        id: 'height',
        title: 'Your Height',
        type: 'slider',
        optional: true,
        min: 140,
        max: 210,
        defaultValue: 168,
        unit: 'cm',
      },

      {
        id: 'body-type',
        title: 'Body Type',
        type: 'single-select',
        optional: true,
        options: [
          {
            id: 'hourglass',
            label: 'Hourglass',
            description: 'Balanced proportions',
          },
          {
            id: 'rectangle',
            label: 'Rectangle',
            description: 'Straight silhouette',
          },
          {
            id: 'pear',
            label: 'Pear',
            description: 'Hip-focused contour',
          },
          {
            id: 'apple',
            label: 'Apple',
            description: 'Midsection-focused contour',
          },
          {
            id: 'inverted-triangle',
            label: 'Inverted Triangle',
            description: 'Shoulder-focused contour',
          },
        ],
      },

      {
        id: 'typical-sizing',
        title: 'Typical Sizing',
        type: 'size-select',
        optional: true,
        options: [
          {
            id: 'xs',
            label: 'XS',
          },
          {
            id: 's',
            label: 'S',
          },
          {
            id: 'm',
            label: 'M',
          },
          {
            id: 'l',
            label: 'L',
          },
          {
            id: 'xl',
            label: 'XL',
          },
        ],
      },

      {
        id: 'fabric-sensitivities',
        title: 'Fabric Sensitivities',
        type: 'multi-select',
        optional: true,
        options: [
          {
            id: 'wool',
            label: '100% Wool',
          },
          {
            id: 'polyester',
            label: 'Polyester',
          },
          {
            id: 'heavy-latex',
            label: 'Heavy Latex',
          },
          {
            id: 'nickel',
            label: 'Nickel Finishes',
          },
        ],
      },
    ],
  },

  // --------------------------------------------------
  // STEP 4 — DIGITALISE CLOSET
  // --------------------------------------------------
  {
    id: 'digitalise-closet',
    title: 'Get Started!',
    subtitle:
      'Add items you already own to help StyleU curate outfits that blend with your current wardrobe.',
    type: 'wardrobe',
  },
];