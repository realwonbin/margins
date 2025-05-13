import os
import json
import yaml  # ✅ PyYAML 필요
from datetime import date, datetime

posts_dir = "./posts/"
index_json_path = "posts/index.json"

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
            print(f"[파일: {filename}]")
            print("🟡 YAML 원본:\n", repr(raw_yaml))
            print("🟢 파싱된 메타:\n", meta)
            return meta, content
    return {}, text



for filename in os.listdir(posts_dir):
    if not filename.lower().endswith(".md"):
        continue  # ✅ .md만 처리

    filepath = os.path.join(posts_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
            raw = f.read()
            meta, markdown = extract_yaml_front_matter(raw, filename)

            # ✅ summary: 본문에서 첫 비어있지 않은 줄
            lines = markdown.split('\n')
            summary = next((line.strip() for line in lines if line.strip()), '')
            # ✅ 여기에 조건 추가
            if not summary or summary.strip() == '---':
                    summary = ''
            elif len(summary) > 100:
                    summary = summary[:97] + '...'
            # ✅ 날짜 문자열로 직렬화
            raw_date = meta.get("date", "")
            if isinstance(raw_date, (datetime, date)):
                date_str = raw_date.strftime("%Y-%m-%d")
            else:
                date_str = str(raw_date)

            # ✅ tags: 문자열이면 리스트로 변환
            tags = meta.get("tags", [])
            if isinstance(tags, str):
                tags = [t.strip() for t in tags.split(',')]

            post_entries.append({
                "file": filename,
                "title": meta.get("title", filename),
                "date": date_str,
                "tags": tags,
                "summary": summary
            })

# ✅ 날짜 기준 내림차순 정렬
post_entries.sort(key=lambda x: x["date"], reverse=True)

# ✅ JSON 저장
with open(index_json_path, "w", encoding="utf-8") as f:
    json.dump(post_entries, f, ensure_ascii=False, indent=2)

print(f"✔ index.json 생성 완료 → {index_json_path}")


