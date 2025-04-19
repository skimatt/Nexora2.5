// src/components/ethicalDecisionFramework.jsx
export const EthicalDecisionFramework = {
  evaluate: (prompt, context) => {
    // Simple ethical evaluation: check for sensitive keywords
    const sensitiveKeywords = ["harm", "violence", "hate", "discrimination"];
    const isEthical = !sensitiveKeywords.some((keyword) =>
      prompt.toLowerCase().includes(keyword)
    );
    return isEthical
      ? { isEthical: true }
      : {
          isEthical: false,
          reason:
            "Prompt contains content that does not meet ethical standards.",
        };
  },
};
