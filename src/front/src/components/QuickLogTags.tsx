import { Box, Chip, Typography } from '@mui/material';
import type { Tag } from '../services/healthLogService';
import { useLanguage } from '../i18n/LanguageContext';

interface QuickLogTagsProps {
  availableTags: Tag[];
  selectedTags: Tag[];
  onTagToggle: (tag: Tag) => void;
  maxTags?: number;
}

const QuickLogTags = ({ availableTags, selectedTags, onTagToggle, maxTags }: QuickLogTagsProps) => {
  const { t, translateTag } = useLanguage();

  const CATEGORY_LABELS: Record<string, string> = {
    energy: t('category_energy'),
    appetite: t('category_appetite'),
    mobility: t('category_mobility'),
    mood: t('category_mood'),
    sleep: t('category_sleep'),
    behavior: t('category_behavior'),
  };

  // Group tags by category
  const tagsByCategory = availableTags.reduce((acc, tag) => {
    const category = tag.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tag);
    return acc;
  }, {} as Record<string, Tag[]>);

  const handleTagClick = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (maxTags && selectedTags.length >= maxTags && !isSelected) {
      return; // Don't allow selecting more than maxTags
    }
    onTagToggle(tag);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Object.entries(tagsByCategory).map(([category, tags]) => (
        <Box key={category}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mb: 1,
              fontWeight: 600,
              color: 'text.secondary',
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
            }}
          >
            {CATEGORY_LABELS[category] || category}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.map((tag) => {
              const isSelected = selectedTags.some(t => t.id === tag.id);
              return (
                <Chip
                  key={tag.id}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span style={{ fontSize: '1.1rem' }}>{tag.icon}</span>
                      <span style={{ fontSize: '0.875rem' }}>{translateTag(tag.label)}</span>
                    </Box>
                  }
                  onClick={() => handleTagClick(tag)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  size="small"
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 1,
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default QuickLogTags;
