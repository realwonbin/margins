document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const fileName = params.get('file');
  const content = document.getElementById('content');

  if (!fileName) {
    content.innerHTML = "<p>게시물이 지정되지 않았습니다.</p>";
    return;
  }

  // 경로 주의: 현재 폴더에 있는 index.json을 참조합니다.
  fetch('./index.json')
    .then(res => {
      if (!res.ok) throw new Error("index.json을 찾을 수 없습니다.");
      return res.json();
    })
    .then(posts => {
      const post = posts.find(p => p.file === fileName);
      if (!post || !post.content) throw new Error("본문 내용이 비어있거나 파일을 찾을 수 없습니다.");

      // 마크다운 변환 및 출력
      marked.setOptions({ breaks: true });
      const dateLine = post.date + (post.location ? ` · ${post.location}` : '');

      content.innerHTML = `
        <h1 class="post-title">${post.title}</h1>
        <div class="post-meta">${dateLine}</div>
        <div class="post-body">${marked.parse(post.content)}</div>
      `;

      // 네비게이션 (이전/다음)
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