import type { StyleUColors } from '../../styleu-theme';
import { createCatalogueStyles } from './create-outfit-catalogue';
import { createItemStyles } from './create-outfit-item';
import { createSaveStyles } from './create-outfit-save';
import { createThemeStyles } from './create-outfit-theme';
import { createVisualiserStyles } from './create-outfit-visualiser';

export const createStyles = (colors: StyleUColors) => ({
  ...createThemeStyles(colors),
  ...createVisualiserStyles(colors),
  ...createItemStyles(colors),
  ...createCatalogueStyles(colors),
  ...createSaveStyles(colors),
});
