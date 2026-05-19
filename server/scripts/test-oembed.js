const axios = require('axios');

async function test(id) {
  const r = await axios.get('https://www.youtube.com/oembed', {
    params: { url: `https://www.youtube.com/watch?v=${id}`, format: 'json' },
    timeout: 10000,
  });
  const embedMatch = r.data.html?.match(/embed\/([^"?]+)/);
  console.log('input:', id, 'embed id:', embedMatch?.[1], 'title:', r.data.title?.slice(0, 40));
}

async function main() {
  for (const id of ['rvobcfGKsXU', 'rvobcfGKsxU']) {
    try {
      await test(id);
    } catch (e) {
      console.log('input:', id, 'FAIL', e.response?.status || e.message);
    }
  }
}

main();
