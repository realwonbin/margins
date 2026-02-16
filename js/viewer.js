document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const fileName = params.get('file');
  const content = document.getElementById('content');

  if (!fileName) {
    content.innerHTML = "<p>게시물을 지정하지 않았습니다.</p>";
    return;
  }

  // 1. 목록 정보를 가져옴 (경로 수정: ./index.json)
  fetch('./index.json')
    .then(res => res.json())
    .then(posts => {
      const postMeta = posts.find(p => p.file === fileName);
      if (!postMeta) throw new Error("목록에 해당 정보가 없습니다.");

      // 2. 실제 마크다운 본문 파일 불러오기 (posts 폴더 내)
      return fetch(`./posts/${fileName}`).then(res => {
        if (!res.ok) throw new Error("본문 파일을 찾을 수 없습니다.");
        return res.text().then(mdText => ({ postMeta, mdText, posts }));
      });
    })
    .then(({ postMeta, mdText, posts }) => {
      // 마크다운에서 YAML(---) 부분 제거 로직
      const parts = mdText.split('---');
      const markdown = parts.length >= 3 ? parts.slice(2).join('---') : mdText;

      marked.setOptions({ breaks: true });
      const dateLine = postMeta.date + (postMeta.location ? ` · ${postMeta.location}` : '');

      content.innerHTML = `
        <h1 class="post-title">${postMeta.title}</h1>
        <div class="post-meta">${dateLine}</div>
        <div class="post-body">${marked.parse(markdown)}</div>
      `;

      // 네비게이션 생성
      const currentIndex = posts.findIndex(p => p.file === fileName);
      const prev = posts[currentIndex + 1];
      const next = posts[currentIndex - 1];

      let navHTML = '<nav class="post-nav">';
      navHTML += prev ? `<a href="viewer.html?file=${encodeURIComponent(prev.file)}">← ${prev.title}</a>` : '<span></span>';
      navHTML += next ? `<a href="viewer.html?file=${encodeURIComponent(next.file)}">${next.title} →</a>` : '<span></span>';
      navHTML += '</nav>';
      content.innerHTML += navHTML;
    })
    .catch(err => {
      content.innerHTML = `<p style="color:#c0392b;">오류: ${err.message}</p>`;
    });
});