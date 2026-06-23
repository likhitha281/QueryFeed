import urllib.request
import xml.etree.ElementTree as ET
import re
import html
from flask import Flask, jsonify, render_template

app = Flask(__name__)

def clean_html_for_tweet(html_str):
    if not html_str:
        return ""
    # Replace list items with bullets and space
    s = re.sub(r'<li>', '• ', html_str)
    # Replace paragraphs, breaks, headers with newlines
    s = re.sub(r'</p>|<br\s*/?>|</h3>|</ul>|</div>', '\n', s)
    # Strip any other html tags
    s = re.sub(r'<[^>]*>', '', s)
    # Decode html entities
    s = html.unescape(s)
    # Clean up excess empty lines
    s = re.sub(r'\n\s*\n', '\n', s)
    return s.strip()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/releases')
def get_releases():
    url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
    try:
        # Fetch RSS feed
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()
        
        root = ET.fromstring(xml_data)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        entries = root.findall('atom:entry', ns)
        
        all_updates = []
        for entry_idx, entry in enumerate(entries):
            title = entry.find('atom:title', ns).text  # Date string, e.g., "June 22, 2026"
            updated = entry.find('atom:updated', ns).text
            link_elem = entry.find('atom:link', ns)
            link = link_elem.attrib.get('href') if link_elem is not None else ""
            content_elem = entry.find('atom:content', ns)
            content = content_elem.text if content_elem is not None else ""
            
            if not content:
                continue
                
            # Split by h3 header, using positive lookahead
            parts = re.split(r'(?=<h3>)', content)
            part_idx = 0
            for part in parts:
                if not part.strip():
                    continue
                
                h_match = re.match(r'<h3>(.*?)</h3>(.*)', part, re.DOTALL)
                if h_match:
                    tag = h_match.group(1).strip()
                    body = h_match.group(2).strip()
                else:
                    tag = "Update"
                    body = part.strip()
                
                update_id = f"bq-{entry_idx}-{part_idx}"
                part_idx += 1
                
                text_content = clean_html_for_tweet(body)
                
                all_updates.append({
                    "id": update_id,
                    "date": title,
                    "updated": updated,
                    "type": tag,
                    "content": body,
                    "text_content": text_content,
                    "link": link
                })
                
        return jsonify({
            "status": "success",
            "updates": all_updates
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
