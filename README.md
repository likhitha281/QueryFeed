# QueryFeed ⚡

QueryFeed is a responsive, dark-themed web application that fetches, parses, and displays Google Cloud BigQuery release notes in real time. It allows cloud developers, engineers, and tech writers to browse the latest updates, filter by type (Features, Announcements, Issues, Deprecations, and Fixes), and compose and publish formatted updates directly to Twitter/X with a single click.

---

## ✨ Features

- **Real-Time Atom Parsing**: Connects directly to the official Google Cloud BigQuery release notes feed and splits multi-topic entries into individual, readable cards.
- **Dynamic Search & Filters**: Search updates by keywords or filter by category badges (Features, Announcements, Issues, Deprecations, Fixes) instantaneously without page reloads.
- **Tweet Composer Modal**: A custom, interactive tweet editor that automatically drafts character-optimized posts complete with the update summary and official link.
- **Smart Character Validation**: Active character validation warning users if the draft exceeds the 280-character limit before posting.
- **Premium Dark Aesthetics**: Styled with a sleek slate-dark theme, glowing ambient accents, smooth hover animations, and responsiveness across mobile, tablet, and desktop viewports.

---

## 🛠️ Technology Stack

- **Backend**: Python, Flask (with standard library XML parsing)
- **Frontend**: Plain vanilla HTML5, CSS3 (variables, transitions, glassmorphic effects), and ES6+ JavaScript
- **API integration**: Google Cloud Release RSS Feed & Twitter/X Web Intent API

---

## 📁 Repository Structure

```text
QueryFeed/
│
├── static/
│   ├── app.js       # Client-side controllers (filtering, search, modal)
│   └── style.css    # Premium CSS design system, colors, and animations
│
├── templates/
│   └── index.html   # Main Dashboard template (HTML5 structure)
│
├── app.py           # Flask server, feed parsing logic & API endpoints
├── .gitignore       # Python/IDE standard ignores
├── LICENSE          # MIT License
└── README.md        # Documentation and guide
```

---

## 🚀 Getting Started

Follow these steps to set up and run QueryFeed locally on your machine.

### Prerequisites

Make sure you have **Python 3.x** installed. You can check your version by running:
```bash
python --version
```

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/likhitha281/QueryFeed.git
   cd QueryFeed
   ```

2. **Install Flask**:
   QueryFeed only requires standard library modules, except for Flask itself:
   ```bash
   pip install Flask
   ```

### Running the App

1. **Launch the development server**:
   ```bash
   python app.py
   ```

2. **Access the application**:
   Open your preferred browser and navigate to:
   ```http
   http://127.0.0.1:5000
   ```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
