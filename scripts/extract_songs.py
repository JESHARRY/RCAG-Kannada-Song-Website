import os
import glob
import re
import json

root_dir = r'e:\ARTS\Church\2026\Songs\Kannada-Christian-songs-master'
output_dir = os.path.join(root_dir, 'src', 'data')
public_data_dir = os.path.join(root_dir, 'public', 'data')
os.makedirs(output_dir, exist_ok=True)
os.makedirs(public_data_dir, exist_ok=True)

html_files = glob.glob(os.path.join(root_dir, '*.html'))

non_song_files = {
    'index.html', 'about.html', 'settings.html', 'kannada-offline-home.html', 
    'kannada-offline-home-sbook.html', 'offline-home.html', 'offline-home-sbook.html', 
    'online-home.html', 'chordssample.html', 'main.html'
}

songs = []
parsing_warnings = []
title_map = {}
duplicates_detected = []

for f in sorted(html_files):
    fname = os.path.basename(f)
    if fname in non_song_files:
        continue
    
    with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
        content = fp.read()
    
    # Generate clean URL slug & ID
    slug = fname.replace('.html', '').lower()
    slug = re.sub(r'[^\w-]', '', slug)
    song_id = slug
    
    # 1. Title Extraction
    title_m = re.search(r'<h5>(.*?)</h5>', content, re.DOTALL)
    title_kannada = ""
    title_english = ""
    song_number = None
    
    if title_m:
        h5_text = title_m.group(1).strip()
        lines = [re.sub(r'<[^>]+>', '', l).strip() for l in re.split(r'<br\s*/?>', h5_text, flags=re.IGNORECASE) if l.strip()]
        if len(lines) >= 1:
            title_kannada = lines[0]
            num_m = re.match(r'^(\d+)\.\s*(.*)', title_kannada)
            if num_m:
                song_number = int(num_m.group(1))
                title_kannada = num_m.group(2).strip()
        if len(lines) >= 2:
            title_english = lines[1]
    else:
        parsing_warnings.append({"file": fname, "issue": "Missing <h5> title tag"})
    
    if not title_kannada:
        title_kannada = fname.replace('.html', '').replace('-', ' ')
    
    # Check duplicate titles
    norm_title = re.sub(r'[^\u0C80-\u0CFFa-zA-Z0-9]', '', title_kannada).lower()
    if norm_title:
        if norm_title in title_map:
            duplicates_detected.append({
                "title": title_kannada,
                "file1": title_map[norm_title],
                "file2": fname
            })
        else:
            title_map[norm_title] = fname
    
    # 2. Key Extraction
    key_m = re.search(r'Key\s*-\s*([A-Ga-g0-9#m\s/]+)', content)
    key = key_m.group(1).strip() if key_m else ""
    
    # 3. Audio Extraction
    audio_m = re.search(r'<audio[^>]+src=["\']([^"\']+)["\']', content)
    audio_url = audio_m.group(1).strip() if audio_m else ""
    
    # 4. Lyrics Extraction
    container_m = re.search(r'<div class="container[^>]*>(.*?)<footer', content, re.DOTALL)
    container_html = container_m.group(1) if container_m else content
    
    highlights = re.findall(r'<div[^>]*class=["\']highlight[^"\'\>]*["\'][^>]*>(.*?)</div>', container_html, re.DOTALL)
    
    lyrics_kannada = ""
    lyrics_english = ""
    
    if len(highlights) >= 2:
        lyrics_kannada = highlights[0].strip()
        lyrics_english = highlights[1].strip()
    elif len(highlights) == 1:
        block = highlights[0].strip()
        p_blocks = re.findall(r'<p[^>]*>.*?</p>', block, re.DOTALL)
        kn_p = []
        en_p = []
        for p in p_blocks:
            if re.search(r'[\u0C80-\u0CFF]', p):
                kn_p.append(p)
            else:
                en_p.append(p)
        if kn_p and en_p:
            lyrics_kannada = "\n".join(kn_p)
            lyrics_english = "\n".join(en_p)
        else:
            lyrics_kannada = block
            lyrics_english = ""
    else:
        parsing_warnings.append({"file": fname, "issue": "No highlight container found"})
    
    def clean_lyrics(raw):
        if not raw:
            return ""
        text = re.sub(r'<!--.*?-->', '', raw, flags=re.DOTALL)
        return text.strip()
    
    lyrics_kannada = clean_lyrics(lyrics_kannada)
    lyrics_english = clean_lyrics(lyrics_english)
    
    has_chords = "data-chord=" in lyrics_kannada or "data-chord=" in lyrics_english or "{" in lyrics_kannada
    has_audio = bool(audio_url)
    
    # Category Assignment
    category = "general"
    if has_chords and has_audio:
        category = "worship"
    elif has_chords:
        category = "chords"
    elif has_audio:
        category = "audio"
    
    tags = []
    if has_chords: tags.append("chords")
    if has_audio: tags.append("audio")
    if song_number: tags.append(f"num-{song_number}")

    song_obj = {
        "id": song_id,
        "slug": slug,
        "number": song_number,
        "titleKannada": title_kannada,
        "titleEnglish": title_english,
        "key": key,
        "lyricsKannada": lyrics_kannada,
        "lyricsEnglish": lyrics_english,
        "chords": key if has_chords else "",
        "audioUrl": audio_url,
        "category": category,
        "tags": tags,
        "originalFile": fname,
        "hasAudio": has_audio,
        "hasChords": has_chords,
        "sourceType": "original_app"
    }
    
    songs.append(song_obj)

print(f"Extracted {len(songs)} song objects.")

# Write to src/data/songs.json and public/data/songs.json
for target in [os.path.join(output_dir, 'songs.json'), os.path.join(public_data_dir, 'songs.json')]:
    with open(target, 'w', encoding='utf-8') as fp:
        json.dump(songs, fp, indent=2, ensure_ascii=False)

# Migration Report Data
report = {
    "total_html_files": len(html_files),
    "non_song_files_count": len(non_song_files),
    "expected_song_count": len(html_files) - len(non_song_files),
    "extracted_song_count": len(songs),
    "discrepancies": (len(html_files) - len(non_song_files)) - len(songs),
    "songs_with_chords": sum(1 for s in songs if s["hasChords"]),
    "songs_with_audio": sum(1 for s in songs if s["hasAudio"]),
    "duplicate_title_count": len(duplicates_detected),
    "duplicate_examples": duplicates_detected,
    "parsing_warnings": parsing_warnings
}

with open(os.path.join(output_dir, 'migration_report.json'), 'w', encoding='utf-8') as fp:
    json.dump(report, fp, indent=2, ensure_ascii=False)

print("Migration script executed successfully.")
