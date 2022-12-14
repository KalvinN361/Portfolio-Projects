import pg8000.native
from io import StringIO
import csv

def export_csv(con):
    assert con is not None
    stream_in = StringIO()
    csv_writer = csv.writer(stream_in)

    stream_out = StringIO()
    con.run("COPY twitter TO STDOUT WITH (FORMAT CSV, HEADER)", stream=stream_out)
    print("Copied Twitter data into memory...")

    print("Dumping memory to csv...")
    stream_out.seek(0)
    with open("/tmp/twitter.csv", "w") as f:
        writer = csv.writer(f)
        for row in csv.reader(stream_out):
            writer.writerow(row)