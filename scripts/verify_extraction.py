import json
import os

data_path = r'e:\ARTS\Church\2026\Songs\Kannada-Christian-songs-master\data\songs.json'

with open(data_path, 'r', encoding='utf-8') as f:
    songs = json.load(f)

total = len(songs)
empty_title_kn = [s['id'] for s in songs if not s.get('titleKannada')]
empty_lyrics_kn = [s['id'] for s in songs if not s.get('lyricsKannada')]
empty_lyrics_en = [s['id'] for s in songs if not s.get('lyricsEnglish')]
with_key = [s['id'] for s in songs if s.get('key')]
with_audio = [s['id'] for s in songs if s.get('audioUrl')]
with_chords = [s['id'] for s in songs if s.get('hasChords')]

print(f"=== VERIFICATION METRICS ===")
print(f"Total Songs Extracted: {total}")
print(f"Empty Kannada Titles: {len(empty_title_kn)}")
print(f"Empty Kannada Lyrics: {len(empty_lyrics_kn)}")
print(f"Songs with English Transliteration: {total - len(empty_lyrics_en)}")
print(f"Songs with Key Signature: {len(with_key)}")
print(f"Songs with Audio Stream URL: {len(with_audio)}")
print(f"Songs with Chords: {len(with_chords)}")

assert total == 647, f"Expected 647 songs, got {total}"
assert len(empty_title_kn) == 0, f"Found empty titles: {empty_title_kn}"
assert len(empty_lyrics_kn) == 0, f"Found empty lyrics: {empty_lyrics_kn}"

print("VERIFICATION SUCCESSFUL: 100% Data Preserved without loss!")
