// Simulates backend AI extraction

export const submitProfileForExtraction = async (data) => {
  console.log("🔥 MOCK: submitProfileForExtraction", data);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        extraction_id: "mock_123",
        status: "processing",
      });
    }, 1000);
  });
};

export const getExtractionStatus = async (id) => {
  console.log("🔥 MOCK: getExtractionStatus", id);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: "completed",
        data: {
          skills: ["Python", "React", "Node.js"],
          projects: ["Chat App", "E-commerce Website"],
          github_languages: ["JavaScript", "Python"],
        },
      });
    }, 2000);
  });
};