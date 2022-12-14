import tiktok
import twitch
import twitter
import youtube
import user
import twitterSpaces
import os
import pg8000.native
from gcloud import storage

def hello_world(request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """
    print("Excetuing main...")
    main()
    print("Done executing main!")
    return "Done!"

def main():
    con = pg8000.native.Connection("postgres", host="db.ihboqqomxmcwyjbxrlpj.supabase.co", database="postgres", password="7ySDDiR3aRVFTdFa")
    print("Connected to Postgres...")
    tiktok.export_csv(con)
    twitch.export_csv(con)
    twitter.export_csv(con)
    youtube.export_csv(con)
    user.export_csv(con)
    twitterSpaces.export_csv(con)
    print("Done exporting csvs!")

    # uploading csvs to google cloud storage
    print("Uploading csvs to google cloud storage...")
    client = storage.Client.from_service_account_json("mindr-359117-61a6d45350e5.json")
    bucket = client.get_bucket("openloot_socials")
    blob = bucket.blob("tiktok.csv")
    blob.upload_from_filename("/tmp/tiktok.csv")
    blob = bucket.blob("twitch.csv")
    blob.upload_from_filename("/tmp/twitch.csv")
    blob = bucket.blob("twitter.csv")
    blob.upload_from_filename("/tmp/twitter.csv")
    blob = bucket.blob("youtube.csv")
    blob.upload_from_filename("/tmp/youtube.csv")
    blob = bucket.blob("user.csv")
    blob.upload_from_filename("/tmp/user.csv")
    blob = bucket.blob("twitterSpaces.csv")
    blob.upload_from_filename("/tmp/twitterSpaces.csv")
    print("Done uploading csvs!")

    # delete csvs
    print("Deleting csvs...")
    os.remove("/tmp/tiktok.csv")
    os.remove("/tmp/twitch.csv")
    os.remove("/tmp/twitter.csv")
    os.remove("/tmp/youtube.csv")
    os.remove("/tmp/user.csv")
    os.remove("/tmp/twitterSpaces.csv")

    print("Done deleting csvs!")
    # close connection
    con.close()

# # if this file is being executed directly, run main()
# if __name__ == "__main__":
#     main()