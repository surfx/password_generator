import os
import json


class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self._db_file = os.path.join(BASE_DIR, "db_json", "pass_gen_db.json")

    def load(self):
        if os.path.exists(self._db_file):
            try:
                with open(self._db_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {"users": [], "passwords": [], "tokens": []}

    def save(self, data):
        os.makedirs(os.path.dirname(self._db_file), exist_ok=True)
        with open(self._db_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)


db = Database()
