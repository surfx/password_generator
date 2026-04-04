from __future__ import annotations
import os
import datetime


class Logger:
    _instance: Logger | None = None
    _log_days: int = 1
    _initialized: bool = False
    _log_file: str = ""

    def __new__(cls) -> Logger:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return
        self._initialized = True
        base_dir: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self._log_file = os.path.join(base_dir, "db_json", "app.log")
        self._clean_old_logs()

    def _ensure_log_dir(self) -> None:
        os.makedirs(os.path.dirname(self._log_file), exist_ok=True)

    def _clean_old_logs(self) -> None:
        if not os.path.exists(self._log_file):
            return

        try:
            cutoff: datetime.datetime = datetime.datetime.now() - datetime.timedelta(
                days=self._log_days
            )
            temp_file: str = self._log_file + ".tmp"

            with open(self._log_file, "r", encoding="utf-8") as f_in:
                with open(temp_file, "w", encoding="utf-8") as f_out:
                    for line in f_in:
                        try:
                            date_str: str = line.split("]")[0].replace("[", "").strip()
                            log_date: datetime.datetime = datetime.datetime.strptime(
                                date_str, "%Y-%m-%d %H:%M:%S"
                            )
                            if log_date >= cutoff:
                                f_out.write(line)
                        except Exception:
                            f_out.write(line)

            os.replace(temp_file, self._log_file)
        except Exception as e:
            print(f"Error cleaning logs: {e}")

    def _write(
        self,
        level: str,
        message: str,
        details: str | None = None,
        source: str = "SERVER",
    ) -> None:
        self._ensure_log_dir()
        timestamp: str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry: str = f"[{timestamp}] [{level}] [{source}] {message}"
        if details:
            log_entry += f" | {details}"
        log_entry += "\n"
        with open(self._log_file, "a", encoding="utf-8") as f:
            f.write(log_entry)

    def info(
        self, message: str, details: str | None = None, source: str = "SERVER"
    ) -> None:
        self._write("INFO", message, details, source)

    def error(
        self, message: str, details: str | None = None, source: str = "SERVER"
    ) -> None:
        self._write("ERROR", message, details, source)

    def debug(
        self, message: str, details: str | None = None, source: str = "SERVER"
    ) -> None:
        self._write("DEBUG", message, details, source)

    def warning(
        self, message: str, details: str | None = None, source: str = "SERVER"
    ) -> None:
        self._write("WARNING", message, details, source)


logger: Logger = Logger()
