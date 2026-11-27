import { describe, expect, it } from "vitest";
import { parseGradeInput, sameIds, type GradingQuestion } from "@/lib/admin/grading";

const questions: GradingQuestion[] = [
  { id: 1, type: "multiple_choice", prompt: "Câu 1", helperText: null, points: 2, allowMultiple: false, options: [] },
  { id: 2, type: "essay", prompt: "Câu 2", helperText: null, points: 3, allowMultiple: false, options: [] },
];

describe("sameIds", () => {
  it("so sánh tập đáp án không phụ thuộc thứ tự", () => {
    expect(sameIds([3, 1], [1, 3])).toBe(true);
    expect(sameIds([1], [1, 3])).toBe(false);
    expect(sameIds([1, 2], [1, 3])).toBe(false);
  });
});

describe("parseGradeInput", () => {
  it("đọc điểm, nhận xét và điểm từng câu", () => {
    const input = parseGradeInput(
      {
        grade: "7.5",
        feedback: "  Khá tốt  ",
        answers: [
          { questionId: 1, pointsAwarded: 2, isCorrect: true, teacherComment: "" },
          { questionId: 2, pointsAwarded: "1.25", teacherComment: "Thiếu ý" },
        ],
      },
      questions,
    );
    expect(input.status).toBe("graded");
    expect(input.grade).toBe(7.5);
    expect(input.feedback).toBe("Khá tốt");
    expect(input.answers[0]).toEqual({ questionId: 1, pointsAwarded: 2, isCorrect: true, teacherComment: null });
    expect(input.answers[1].pointsAwarded).toBe(1.25);
    expect(input.answers[1].isCorrect).toBeNull();
  });

  it("bắt buộc có điểm khi chấm", () => {
    expect(() => parseGradeInput({ answers: [] }, questions)).toThrow("Vui lòng nhập điểm");
  });

  it("cho phép bỏ điểm khi trả về chờ chấm", () => {
    expect(parseGradeInput({ status: "submitted" }, questions).grade).toBeNull();
  });

  it("chặn điểm ngoài thang 10 và vượt điểm tối đa của câu", () => {
    expect(() => parseGradeInput({ grade: 11 }, questions)).toThrow("từ 0 đến 10");
    expect(() =>
      parseGradeInput({ grade: 5, answers: [{ questionId: 1, pointsAwarded: 3 }] }, questions),
    ).toThrow("từ 0 đến 2");
  });

  it("chặn câu hỏi không thuộc bài tập", () => {
    expect(() => parseGradeInput({ grade: 5, answers: [{ questionId: 99 }] }, questions)).toThrow(
      "không thuộc bài tập",
    );
  });
});
