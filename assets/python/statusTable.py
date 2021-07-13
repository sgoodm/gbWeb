import pandas as pd
import requests
import sys

allBounds = pd.read_csv("//__w/gbWeb/geoBoundaryBot/dta/iso_3166_1_alpha_3.csv", encoding='utf8').astype(str).dropna(axis=1,how='all')

allOpen = requests.get("https://www.geoboundaries.org/api/current/gbOpen/ALL/ALL/").json()


webJSON = {}
ADMs = ["ADM0", "ADM1", "ADM2", "ADM3", "ADM4", "ADM5", "ADM6"]

for bound in allBounds.iterrows():
    print(bound)
    ISO = bound[0]["Alpha-3code"]
    webJSON[ISO] = {}
    webJSON[ISO]["ISO"] = ISO
    webJSON[ISO]["Name"] = bound[0]["Name"]
    webJSON[ISO]["Claimant(s)"] = bound[0]["Claimant(s)"]
    webJSON[ISO]["Disputed"] = bound[0]["Disputed"]
    webJSON[ISO]["Continent"] = bound[0]["Continent"]

    for adm in ADMs:
        print(adm)
        print(webJSON)
        sys.exit()
        
        #loop
