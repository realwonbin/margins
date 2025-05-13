document.addEventListener("DOMContentLoaded", () => {
  const file = decodeURIComponent(new URLSearchParams(window.location.search).get('file'));
  const content = document.getElementById('content');

  if (!file) {
    content.innerHTML = "<p>파일이 지정되지 않았습니다.</p>";
    return;
  }

  fetch('../index.json')
    .then(res => res.json())
    .then(posts => {
      const post = posts.find(p => p.file === file);
      if (!post) throw new Error("해당 게시물을 찾을 수 없습니다.");

      // 마크다운 렌더 옵션
      marked.setOptions({ breaks: true });
      const markdown = post.content;
      const dateLine = post.date + (post.location ? ` · ${post.location}` : '');

      content.innerHTML = `
        <h1 class="post-title">${post.title}</h1>
        <div class="post-meta">${dateLine}</div>
        <div class="post-body">${marked.parse(markdown)}</div>
      `;

      const currentIndex = posts.findIndex(p => p.file === file);
      const prev = posts[currentIndex + 1];
      const next = posts[currentIndex - 1];

      let navHTML = '<nav class="post-nav">';
      if (prev) {
        navHTML += `<a class="prev" href="viewer.html?file=${encodeURIComponent(prev.file)}">← ${prev.title}</a>`;
      } else {
        navHTML += `<span></span>`;
      }

      if (next) {
        navHTML += `<a class="next" href="viewer.html?file=${encodeURIComponent(next.file)}">${next.title} →</a>`;
      } else {
        navHTML += `<span></span>`;
      }
      navHTML += '</nav>';

      content.innerHTML += navHTML;
    })
    .catch(err => {
      content.innerHTML = `<p>오류 발생: ${err.message}</p>`;
    });
});
