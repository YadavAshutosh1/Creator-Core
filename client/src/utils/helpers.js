/**
 * Day 7: Industry-standard Helper Functions
 */

export const calculateStats = (text) => {
  if (!text) return { words: 0, time: 0 };
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / 200); // Average reading speed 200 wpm
  return { words, time };
};

export const exportToTxt = (results, videoUrl) => {
  let content = `CREATOR AI EXPORT\n`;
  content += `Source: ${videoUrl}\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `------------------------------------------\n\n`;

  Object.entries(results).forEach(([platform, data]) => {
    const textContent = typeof data === 'object' ? data.text : data;
    const imageUrl = typeof data === 'object' ? data.imageUrl : null;

    content += `[${platform.toUpperCase()}]\n\n`;
    content += `${textContent}\n\n`;
    if (imageUrl) {
      content += `Generated Image URL: ${imageUrl}\n\n`;
    }
    content += `==========================================\n\n`;
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `content-export-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
