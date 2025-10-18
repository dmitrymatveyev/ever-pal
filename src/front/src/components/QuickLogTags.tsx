import { Box, Chip, Typography } from '@mui/material';

export interface LogTag {
  icon: string;
  label: string;
  category: string;
}

export const SENIOR_PET_TAGS: LogTag[] = [
  // Energy
  { icon: '😴', label: 'Tired', category: 'energy' },
  { icon: '🐾', label: 'Active', category: 'energy' },
  { icon: '⚡', label: 'Energetic', category: 'energy' },

  // Appetite
  { icon: '🍽️', label: 'Good appetite', category: 'appetite' },
  { icon: '🚫', label: 'No appetite', category: 'appetite' },
  { icon: '🥘', label: 'Picky eater', category: 'appetite' },

  // Mobility
  { icon: '🦴', label: 'Limping', category: 'mobility' },
  { icon: '🚶', label: 'Walking well', category: 'mobility' },
  { icon: '🛋️', label: 'Stiff after rest', category: 'mobility' },

  // Mood
  { icon: '😊', label: 'Playful', category: 'mood' },
  { icon: '😕', label: 'Restless', category: 'mood' },
  { icon: '😌', label: 'Calm', category: 'mood' },
  { icon: '😰', label: 'Anxious', category: 'mood' },

  // Sleep
  { icon: '💤', label: 'Sleeping well', category: 'sleep' },
  { icon: '🌙', label: 'Restless night', category: 'sleep' },

  // Behavior
  { icon: '🎾', label: 'Played fetch', category: 'behavior' },
  { icon: '🚽', label: 'Accident indoors', category: 'behavior' },
  { icon: '🤔', label: 'Confused', category: 'behavior' },
];

const CATEGORY_LABELS: Record<string, string> = {
  energy: 'Energy Level',
  appetite: 'Appetite',
  mobility: 'Mobility',
  mood: 'Mood & Behavior',
  sleep: 'Sleep',
  behavior: 'Other Observations',
};

interface QuickLogTagsProps {
  selectedTags: string[];
  onTagToggle: (label: string) => void;
  maxTags?: number;
}

const QuickLogTags = ({ selectedTags, onTagToggle, maxTags }: QuickLogTagsProps) => {
  // Group tags by category
  const tagsByCategory = SENIOR_PET_TAGS.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = [];
    }
    acc[tag.category].push(tag);
    return acc;
  }, {} as Record<string, LogTag[]>);

  const handleTagClick = (label: string) => {
    if (maxTags && selectedTags.length >= maxTags && !selectedTags.includes(label)) {
      return; // Don't allow selecting more than maxTags
    }
    onTagToggle(label);
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
              const isSelected = selectedTags.includes(tag.label);
              return (
                <Chip
                  key={tag.label}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <span style={{ fontSize: '1.1rem' }}>{tag.icon}</span>
                      <span style={{ fontSize: '0.875rem' }}>{tag.label}</span>
                    </Box>
                  }
                  onClick={() => handleTagClick(tag.label)}
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
