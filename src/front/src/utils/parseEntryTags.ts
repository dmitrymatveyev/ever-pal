import { SENIOR_PET_TAGS, type LogTag } from '../components/QuickLogTags';

export interface ParsedEntry {
  tags: LogTag[];
  notes: string;
}

/**
 * Parse entry text to extract tags and notes
 * Format: "Tag1, Tag2. Notes here" or just "Tag1, Tag2"
 */
export function parseEntryTags(entryText: string): ParsedEntry {
  if (!entryText) {
    return { tags: [], notes: '' };
  }

  // Split by ". " to separate potential tags from notes
  const parts = entryText.split('. ');

  if (parts.length === 1) {
    // No notes, might be just tags or just text
    const tagLabels = parts[0].split(', ');
    const parsedTags = tagLabels
      .map(label => SENIOR_PET_TAGS.find(tag => tag.label === label.trim()))
      .filter((tag): tag is LogTag => tag !== undefined);

    // If we found tags, they are tags. Otherwise, it's all notes
    if (parsedTags.length > 0) {
      return { tags: parsedTags, notes: '' };
    } else {
      return { tags: [], notes: entryText };
    }
  }

  // Has ". " separator - first part might be tags
  const potentialTagText = parts[0];
  const tagLabels = potentialTagText.split(', ');
  const parsedTags = tagLabels
    .map(label => SENIOR_PET_TAGS.find(tag => tag.label === label.trim()))
    .filter((tag): tag is LogTag => tag !== undefined);

  // If we found valid tags, treat first part as tags and rest as notes
  if (parsedTags.length > 0) {
    const notes = parts.slice(1).join('. ');
    return { tags: parsedTags, notes };
  }

  // No valid tags found, treat everything as notes
  return { tags: [], notes: entryText };
}
