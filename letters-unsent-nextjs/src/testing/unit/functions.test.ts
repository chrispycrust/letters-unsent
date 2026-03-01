import { convertDate, tagAIGeneratedLetters, truncateContent } from "@/utils/functions";

describe("utils/functions", () => {
  it("formats dates into a human-readable string", () => {
    const formatted = convertDate(new Date("2026-01-05T00:00:00.000Z"));

    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
    expect(formatted).toContain("2026");
  });

  it("returns original content when under the word limit", () => {
    const content = "One short letter that should not be truncated.";

    expect(truncateContent(content)).toBe(content);
  });

  it("truncates content over the word limit", () => {
    const longContent = Array.from({ length: 120 }, (_, index) => `word${index + 1}`).join(" ");
    const truncated = truncateContent(longContent);

    expect(truncated).not.toBe(longContent);
    expect(truncated.endsWith(" ...")).toBe(true);
  });

  it("tags seeded AI letters by id range", () => {
    expect(tagAIGeneratedLetters("1")).toBe(true);
    expect(tagAIGeneratedLetters("21")).toBe(true);
    expect(tagAIGeneratedLetters("22")).toBe(false);
    expect(tagAIGeneratedLetters("0")).toBe(false);
  });
});
