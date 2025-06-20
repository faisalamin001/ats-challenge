import { anonymizeCV } from '../utils/anonymizeCV';

describe('anonymizeCV', () => {
  it('removes emails', () => {
    const input = 'Contact me at test@example.com.';
    const output = anonymizeCV(input);
    expect(output).toContain('[Email Removed]');
    expect(output).not.toContain('test@example.com');
  });

  it('removes phone numbers with at least 10 digits', () => {
    const input = 'My phone number is +1 555-123-4567.';
    const output = anonymizeCV(input);
    expect(output).toContain('[Phone Removed]');
    expect(output).not.toContain('555-123-4567');
  });

  it('does not remove short numbers or date ranges', () => {
    const input = 'Experience: 2022-2023';
    const output = anonymizeCV(input);
    // It should not remove a valid date range (which typically contains fewer than 10 digits overall)
    expect(output).toContain('2022-2023');
  });
});
