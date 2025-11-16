import { useTranslation } from 'react-i18next';

/**
 * Hook to get localized level data
 */
export function useLocalizedLevels<T extends { id: string; title: string; description: string }>(
  levels: T[],
): T[] {
  const { t } = useTranslation();

  return levels.map((level) => ({
    ...level,
    title: t(`levels.${level.id}.title`),
    description: t(`levels.${level.id}.description`),
  }));
}

/**
 * Hook to get a single localized level
 */
export function useLocalizedLevel<T extends { id: string; title: string; description: string }>(
  level: T,
): T {
  const { t } = useTranslation();

  return {
    ...level,
    title: t(`levels.${level.id}.title`),
    description: t(`levels.${level.id}.description`),
  };
}
