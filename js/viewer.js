document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const fileName = params.get('file');
  const content = document.getElementById('content');

  if (!fileName) {
    content.innerHTML = "<p>게시물이 지정되지 않았습니다.</p>";
    return;
  }

  // 1. 목록 파일 읽기
  fetch('./index.json')
    .then(res => {
      if (!res.ok) throw new Error("index.json을 찾을 수 없습니다.");
      return res.json();
    })
    .then(posts => {
      const postMeta = posts.find(p => p.file === fileName);
      if (!postMeta) throw new Error("목록에서 해당 정보를 찾을 수 없습니다.");

      // 2. posts 폴더 안의 실제 마크다운 파일 읽기 (중요: 경로 수정)
      return fetch(`./posts/${fileName}`).then(res => {
        if (!res.ok) throw new Error(`posts/${fileName} 파일을 찾을 수 없습니다.`);
        return res.text().then(mdText => ({ postMeta, mdText, posts }));
      });
    })
    .then(({ postMeta, mdText, posts }) => {
      // 마크다운 변환 및 출력
      marked.setOptions({ breaks: true });
      const dateLine = postMeta.date + (postMeta.location ? ` · ${postMeta.location}` : '');

      content.innerHTML = `
        <h1 class="post-title">${postMeta.title}</h1>
        <div class="post-meta">${dateLine}</div>
        <div class="post-body">${marked.parse(mdText)}</div>
      `;

      // 이전/다음 네비게이션
      const idx = posts.findIndex(p => p.file === fileName);
      const prev = posts[idx + 1];
      const next = posts[idx - 1];

      let navHTML = '<nav class="post-nav" style="display:flex; justify-content:space-between; margin-top:50px; border-top:1px solid #eee; padding-top:20px;">';
      navHTML += prev ? `<a href="viewer.html?file=${encodeURIComponent(prev.file)}">← ${prev.title}</a>` : '<span></span>';
      navHTML += next ? `<a href="viewer.html?file=${encodeURIComponent(next.file)}">${next.title} →</a>` : '<span></span>';
      navHTML += '</nav>';
      content.innerHTML += navHTML;
    })
    .catch(err => {
      content.innerHTML = `<p style="color:#c0392b;">오류: ${err.message}</p>`;
    });
});