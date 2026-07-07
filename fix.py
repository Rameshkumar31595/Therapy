import os

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace 'చికిత్స' (treatment) with 'థెరపీ' (therapy)
    content = content.replace('చికిత్సలకు', 'థెరపీలకు')
    content = content.replace('చికిత్సలను', 'థెరపీలను')
    content = content.replace('చికిత్సలలో', 'థెరపీలలో')
    content = content.replace('చికిత్సకు', 'థెరపీకి')
    content = content.replace('చికిత్సలు', 'థెరపీలు')
    content = content.replace('చికిత్స', 'థెరపీ')

    # Replace 'ఆయుర్వేద' / 'ఆయుర్వేదం' (Ayurveda)
    content = content.replace('కేరళ ఆయుర్వేద సంప్రదాయం', 'కేరళ మసాజ్ సంప్రదాయం')
    content = content.replace('ఆయుర్వేద అనుభవం', 'మసాజ్ అనుభవం')
    content = content.replace('ఆయుర్వేద పద్ధతుల్లో', 'మసాజ్ పద్ధతుల్లో')
    content = content.replace('ఆయుర్వేద మరియు', 'మరియు')
    content = content.replace('ఆయుర్వేద థెరపిస్ట్', 'థెరపిస్ట్')
    content = content.replace('ఆయుర్వేద థెరపీ', 'మసాజ్ థెరపీ')
    content = content.replace('ఆయుర్వేదాన్ని', 'మసాజ్ సంప్రదాయాన్ని')
    content = content.replace('ఆయుర్వేద సర్టిఫికేట్లు', 'మసాజ్ సర్టిఫికేట్లు')
    content = content.replace('ఆయుర్వేద సేవలు', 'మసాజ్ సేవలు')
    content = content.replace('కేరళ ఆయుర్వేదంలో', 'కేరళ మసాజ్ సంప్రదాయంలో')
    content = content.replace('ఆయుర్వేదం ఇచ్చే', 'కేరళ థెరపీ ఇచ్చే')
    content = content.replace('ఆయుర్వేద', 'మసాజ్')
    content = content.replace('ఆయుర్వేదం', 'మసాజ్ సంప్రదాయం')
    
    # Check English
    content = content.replace('Treatments', 'Massage therapies')
    content = content.replace('treatments', 'massage therapies')
    content = content.replace('Treatment', 'Massage therapy')
    content = content.replace('treatment', 'massage therapy')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

files = [
    r'c:\Users\HP\OneDrive\Desktop\Therapy\js\main.js',
    r'c:\Users\HP\OneDrive\Desktop\Therapy\js\bubble.js',
    r'c:\Users\HP\OneDrive\Desktop\Therapy\generate-bubble.py',
    r'c:\Users\HP\OneDrive\Desktop\Therapy\js\certificates.js',
    r'c:\Users\HP\OneDrive\Desktop\Therapy\narration\scripts.json',
    r'c:\Users\HP\OneDrive\Desktop\Therapy\index.html'
]

for f in files:
    replace_in_file(f)
