import { reformatCV } from '../utils/reformatCV';

describe('reformatCV', () => {
  it('formats a raw CV text into structured HTML', () => {
    const rawCV = `
John Doe
New York, NY
PROFESSIONAL SUMMARY
I am a seasoned professional with over 10 years of experience.
EXPERIENCE
Worked at ABC Company from 2010 to 2020.
EDUCATION
Bachelor of Science in Computer Science.
SKILLS
JavaScript, React, Node.js.
    `;
    const output = reformatCV(rawCV);
    
    // Check that the container div is present.
    expect(output).toContain('class="formatted-cv"');

    // Check for a header with the candidate's name and location.
    expect(output).toMatch(/<header[^>]*>[\s\S]*<h1[^>]*>John Doe<\/h1>/);
    expect(output).toMatch(/<p[^>]*>New York, NY<\/p>/);

    // Check that sections with uppercase headings are present.
    expect(output).toMatch(/<h2[^>]*>PROFESSIONAL SUMMARY<\/h2>/);
    expect(output).toMatch(/<h2[^>]*>EXPERIENCE<\/h2>/);
    expect(output).toMatch(/<h2[^>]*>EDUCATION<\/h2>/);
    expect(output).toMatch(/<h2[^>]*>SKILLS<\/h2>/);
  });
});
