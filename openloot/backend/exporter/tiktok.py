from io import StringIO
import csv

def export_csv(con):
    assert con is not None
    stream_in = StringIO()
    csv_writer = csv.writer(stream_in)

    stream_out = StringIO()
    con.run("COPY tiktok TO STDOUT WITH (FORMAT CSV, HEADER)", stream=stream_out)
    print("Copied Tiktok data into memory...")

    print("Dumping memory to csv...")
    stream_out.seek(0)
    with open("/tmp/tiktok.csv", "w") as f:
        writer = csv.writer(f)
        for row in csv.reader(stream_out):
            writer.writerow(row)
