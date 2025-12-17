import os
import json
import yaml
from datetime import date, datetime

posts_dir = "./posts/"  # 🔁 실제 .md 파일 폴더 경로로 수정하세요
index_json_path = "./index.json"  # index.html과 같은 위치

post_entries = []

def extract_yaml_front_matter(text, filename=""):
    if text.startswith('---'):
        parts = text.split('---', 2)
        if len(parts) >= 3:
            raw_yaml = parts[1].strip()
            cleaned_yaml = '\n'.join(line.strip() for line in raw_yaml.splitlines())
            try:
                meta = yaml.safe_load(cleaned_yaml) or {}
            except Exception as e:
                print(f"[!] YAML 파싱 오류 in {filename}: {e}")
                meta = {}
            content = parts[2].strip()
            return meta, content
    return {}, text

for filename in os.listdir(posts_dir):
    if not filename.lower().endswith(".md"):
        continue

    filepath = os.path.join(posts_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        raw = f.read()
        meta, markdown = extract_yaml_front_matter(raw, filename)

        # 요약: 첫 비어있지 않은 줄
        lines = markdown.split('\n')
        summary = next((line.strip() for line in lines if line.strip()), '')
        if not summary or summary.strip() == '---':
            summary = ''

        # 날짜 파싱
        raw_date = meta.get("date", "")
        if isinstance(raw_date, (datetime, date)):
            date_str = raw_date.strftime("%Y-%m-%d")
        else:
            date_str = str(raw_date)

        # 태그 리스트화
        tags = meta.get("tags", [])
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(',')]

        post_entries.append({
            "file": filename,
            "title": meta.get("title", filename),
            "date": date_str,
            "location": meta.get("location", ""),
            "tags": tags,
            "summary": summary,
            "content": markdown
        })

# 날짜 기준 정렬
post_entries.sort(key=lambda x: x["date"], reverse=True)

# 저장
with open(index_json_path, "w", encoding="utf-8") as f:
    json.dump(post_entries, f, ensure_ascii=False, indent=2)

print(f"✔ index.json 생성 완료 → {index_json_path}")
