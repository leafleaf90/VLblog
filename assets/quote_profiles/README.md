# Quote Profile Pictures

This directory can contain profile pictures for quote authors.

## Current Status

Profile pictures are currently **not displayed** on the quotes page to maintain a clean, minimalistic design focused on the text content.

## Future Implementation

To add profile pictures later, place image files here following this naming pattern:

- Convert author name to lowercase
- Replace spaces with underscures
- Remove punctuation (periods, commas, parentheses, etc.)
- Add `.jpg` extension

## Examples

- "Sam Harris" → `sam_harris.jpg`
- "Ralph Waldo Emerson" → `ralph_waldo_emerson.jpg`
- "James Clear" → `james_clear.jpg`
- "J.K. Rowling" → `jk_rowling.jpg`

## Image Requirements

- Format: JPG recommended (PNG also supported by changing the template)
- Size: Recommended 200x200px minimum (will be displayed as 40x40px)
- Shape: Square images work best as they will be displayed in a circle

## Fallback Behavior

If no profile picture is found for an author, the image will be hidden automatically and only the author name will be displayed.
