export type ColourSwatch = {
  name: string;
  hex: string;
};

export type ColourAnalysisPhoto = {
  uri: string;
  width?: number;
  height?: number;
  fileName?: string | null;
  mimeType?: string | null;
};

export type ColourAnalysisResult = {
  season: string;
  undertone: 'Warm' | 'Cool' | 'Neutral';
  skinColour: {
    hex: string;
    rgb: [number, number, number];
  };
  confidence: number;
  palette: ColourSwatch[];
  avoidColours: ColourSwatch[];
  characteristics: {
    depth: string;
    chroma: string;
    contrast: string;
    lightness: number;
    lab: { lightness: number; a: number; b: number };
    hue: number;
    saturation: number;
  };
  explanation: string;
  disclaimer: string;
};

export class ColourAnalysisRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ColourAnalysisRequestError';
  }
}
