import API from "./axios";

/**
 * Upload a resume PDF and trigger AI extraction on the backend.
 * POST /ai/extract-resume  (multipart/form-data)
 *
 * @param {File} file – the PDF File object from an <input type="file">
 * @returns {Promise<object>} – { message, data: { id, student_id, skills, education, projects, experience, certifications, summary, extracted_at } }
 */
export const extractResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post("/ai/extract-resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

/**
 * Get the current student's AI-extracted data.
 * GET /ai/my-data
 *
 * @returns {Promise<object>} – { id, student_id, skills, education, projects, experience, certifications, summary, extracted_at }
 */
export const getMyAIData = async () => {
  const res = await API.get("/ai/my-data");
  return res.data;
};

/**
 * Coordinator: get any student's AI-extracted data.
 * GET /ai/student/:studentId
 *
 * @param {string} studentId
 * @returns {Promise<object>}
 */
export const getStudentAIData = async (studentId) => {
  const res = await API.get(`/ai/student/${studentId}`);
  return res.data;
};