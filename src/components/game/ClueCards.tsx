import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import DirectionCard from './DirectionCard';
import { Direction, GameLevelWord } from './GameField';
import { PlacedWord, getPlacementKey } from '../../utils/wordPlacementUtils';

type ClueCardsProps = {
  placementsByDirection: Record<Direction, GameLevelWord[]>;
  placedWords: Record<string, PlacedWord | null>;
  highlightedDirection: Direction | null;
};

/**
 * Renders the across and down clue cards.
 * Displays a list of clues for each direction, indicating completion status.
 *
 * @param props - Component properties
 * @param props.placementsByDirection - Map of placements grouped by direction
 * @param props.placedWords - Record of currently placed words
 * @param props.highlightedDirection - The direction currently being interacted with
 */
const ClueCards = memo(
  ({ placementsByDirection, placedWords, highlightedDirection }: ClueCardsProps) => {
    const { t } = useTranslation();

    const buildDirectionCardProps = (direction: Direction) => {
      const placements = [...placementsByDirection[direction]].sort((a, b) => {
        const aNum = a.clueNumber ?? Number.MAX_SAFE_INTEGER;
        const bNum = b.clueNumber ?? Number.MAX_SAFE_INTEGER;
        if (aNum !== bNum) {
          return aNum - bNum;
        }
        return getPlacementKey(a.id).localeCompare(getPlacementKey(b.id));
      });
      const entries = placements.map((placement) => {
        const placementKey = getPlacementKey(placement.id);
        const entry = placedWords[placementKey];
        return {
          key: placement.id,
          clueNumber: placement.clueNumber,
          isCompleted: Boolean(entry),
          description: entry?.definition,
        };
      });
      const isHighlighted = highlightedDirection === direction;
      return {
        entries,
        isHighlighted,
      };
    };

    const acrossCardProps = buildDirectionCardProps('across');
    const downCardProps = buildDirectionCardProps('down');

    return (
      <aside className="mt-4 w-full sm:mt-6" aria-label={t('accessibility.wordClues')}>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2">
          <DirectionCard title={t('game.across')} {...acrossCardProps} />
          <DirectionCard title={t('game.down')} {...downCardProps} />
        </div>
      </aside>
    );
  },
);

ClueCards.displayName = 'ClueCards';

export default ClueCards;
