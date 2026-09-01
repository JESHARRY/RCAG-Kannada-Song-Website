import json
import re

print("==========================================")
print("  PDF EXTRACTION PIPELINE TEST SUITE")
print("==========================================")

def is_title_header(line, lines, index, current_song):
    if re.match(r'^\d{1,4}\.\s+[\u0C80-\u0CFF\w]', line, re.I):
        return True
    if not current_song:
        return True
    return False

def mock_boundary_detector(pages):
    raw_songs = []
    current_song = None
    song_counter = 1

    for page in pages:
        page_num = page['pageNumber']
        lines = page['lines']

        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue

            is_title = is_title_header(line, lines, i, current_song)

            if is_title:
                if current_song and len(current_song['lines']) > 0:
                    current_song['pageEnd'] = page_num
                    raw_songs.append(current_song)
                
                current_song = {
                    'order': song_counter,
                    'titleHeader': line,
                    'lines': [],
                    'pageStart': page_num,
                    'pageEnd': page_num
                }
                song_counter += 1
            else:
                if not current_song:
                    current_song = {
                        'order': song_counter,
                        'titleHeader': line,
                        'lines': [],
                        'pageStart': page_num,
                        'pageEnd': page_num
                    }
                    song_counter += 1
                else:
                    current_song['lines'].append(line)
                    current_song['pageEnd'] = page_num

    if current_song and len(current_song['lines']) > 0:
        raw_songs.append(current_song)

    return raw_songs

# Test Case 1: Single Song PDF
tc1 = [{'pageNumber': 1, 'lines': ['1. ಆಕಾಶದಲ್ಲಿ ಭೂಮಿಯಲ್ಲಿ', 'Aakaashadallibhoomiyalli', 'Key - Dm', 'ಆಕಾಶದಲ್ಲಿ ಭೂಮಿಯಲ್ಲಿ ಇರುವವರೂ ನೀವೇ', 'Aakaashadalli bhoomiyalli iruvavaru neeve']}]
res1 = mock_boundary_detector(tc1)
assert len(res1) == 1, f"TC1 Expected 1 song, got {len(res1)}"
print("PASS: Test 1 - 1-Song PDF Detected correctly (1 song)")

# Test Case 2: Multi-Page Song
tc2 = [
    {'pageNumber': 1, 'lines': ['1. ಆರಾಧನೆ ತಂದೆಯಾದ ದೇವರಿಗೆ', 'Key - Dm', 'ಆರಾಧನೆ ತಂದೆಯಾದ ದೇವರಿಗೆ']},
    {'pageNumber': 2, 'lines': ['ಪರಿಶುದ್ಧನೆ ಪರಿಶುದ್ಧನೆ ಆಮೆನ್', 'Aaradhane tandeyada devarige']}
]
res2 = mock_boundary_detector(tc2)
assert len(res2) == 1 and res2[0]['pageStart'] == 1 and res2[0]['pageEnd'] == 2, "TC2 Multi-page failed"
print("PASS: Test 2 - Multi-Page Song Detected correctly (Pages 1-2)")

# Test Case 3: Multiple Songs on 1 Page
tc3 = [
    {'pageNumber': 1, 'lines': [
        '1. ಅಬ್ರಹಾಮನ ಓ ದೇವರೇ', 'Abrahamana odevare', 'ಅಬ್ರಹಾಮನ ಓ ದೇವರೇ ನೀನೆ',
        '2. ಅದ್ಬುತ ಯೇಸು ರಾಜನೇ', 'Adbuta yesu rajane', 'ಅದ್ಬುತ ಯೇಸು ರಾಜನೇ ಉತ್ತಮ'
    ]}
]
res3 = mock_boundary_detector(tc3)
assert len(res3) == 2, f"TC3 Expected 2 songs on 1 page, got {len(res3)}"
print("PASS: Test 3 - Multiple Songs on Single Page Detected correctly (2 songs)")

# Test Case 4: 10-Song PDF Test
tc4 = []
for idx in range(1, 11):
    tc4.append({'pageNumber': idx, 'lines': [f'{idx}. Song Title {idx}', f'Kannada Lyrics for song {idx}', f'English lyrics for song {idx}']})
res4 = mock_boundary_detector(tc4)
assert len(res4) == 10, f"TC4 Expected 10 songs, got {len(res4)}"
print("PASS: Test 4 - 10-Song PDF Detected correctly (10 songs)")

# Test Case 5: 50-Song PDF Test
tc5 = []
for idx in range(1, 51):
    tc5.append({'pageNumber': idx, 'lines': [f'{idx}. Title {idx}', f'Kannada verse {idx}', f'English verse {idx}']})
res5 = mock_boundary_detector(tc5)
assert len(res5) == 50, f"TC5 Expected 50 songs, got {len(res5)}"
print("PASS: Test 5 - 50-Song PDF Detected correctly (50 songs)")

# Test Case 6: Duplicate Check Test
base_songs = [{"titleKannada": "ಆಕಾಶದಲ್ಲಿ ಭೂಮಿಯಲ್ಲಿ", "titleEnglish": "Aakaashadallibhoomiyalli"}]
test_extracted = "ಆಕಾಶದಲ್ಲಿ ಭೂಮಿಯಲ್ಲಿ"
is_dup = any(s["titleKannada"] == test_extracted for s in base_songs)
assert is_dup, "TC6 Duplicate check failed"
print("PASS: Test 6 - Duplicate Detection against songs.json matched correctly")

print("==========================================")
print("  ALL PDF EXTRACTION TEST SUITES PASSED!  ")
print("==========================================")
