import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { AnswerDisplay } from './AnswerDisplay';

vi.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    settings: {
      sourceUrlPrefix: 'https://example.com/',
    },
  }),
}));

vi.mock('./AnswerRating', () => ({
  AnswerRating: () => null,
}));

describe('AnswerDisplay', () => {
  it('renders markdown links with prefix', () => {
    const answer = {
      answer: 'See [document](docs/test.md)',
      sources: ['docs/test.md'],
      mode: 'llm',
      timings_ms: {},
    };

    render(<AnswerDisplay answer={answer} showTimings={false} />);

    const link = screen.getByRole('link', { name: /document/i });
    expect(link).toHaveAttribute('href', 'https://example.com/docs/test.md');
    expect(screen.getByText('Sources (1)')).toBeInTheDocument();
  });
});
