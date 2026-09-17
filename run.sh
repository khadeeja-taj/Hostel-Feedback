#!/usr/bin/env bash
# Start the IIUI Hostel Feedback System
set -e
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt

echo "Starting IIUI Hostel Feedback on http://localhost:5000"
python app.py
