import sys
import re

iso_date_regex = "\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)"
iso_entry_regex = re.compile(f"({iso_date_regex})(.|\n)*?($|(?=({iso_date_regex})))")
log_label_regex = "\x1b\[[1-9]*m[A-Z]*\x1b\[0m"


def parse_logs(filename):
  with open(filename, "rb") as fd:
    logsdata = fd.read().decode("utf-16")

    for match in iso_entry_regex.finditer(logsdata):
      print(match.group(0))


if __name__ == "__main__":
  if len(sys.argv) != 2:
    raise SystemExit(f"Usage: {sys.argv[0]} <path_to_log_file>")
  
  parse_logs(sys.argv[1])


