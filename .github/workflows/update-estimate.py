import copy
import json
import urllib.request
from bs4 import BeautifulSoup

delta_url = "http://dpbmsdelta.web.fc2.com/table/data/insane_data.json"
ereter_url = "http://ereter.net/bmssongs/dpbms/analytics/combined/"


def isfloat(f):
	try: float(f)
	except: return False
	else: return True

def round_level(level):
	if isfloat(level):
		return str(int(float(level) * 4) / 4)
	else:
		return level

def cmp_level(a):
	return float(a["level"]) if isfloat(a["level"]) else 99

def apply_level(delta_data, ereter_data, level):
	for ereter in ereter_data:
		for delta in delta_data:
			if delta["level"] == "?":
				delta["rawlevel"] = "?"
			if delta["lr2_bmsid"] == int(ereter["lr2_bmsid"]):
				delta["level"] = round_level(ereter[level])
				delta["rawlevel"] = ereter[level]
				break
	
	delta_data.sort(key=cmp_level)
	return delta_data

def main():
	delta_req = urllib.request.Request(delta_url)
	with urllib.request.urlopen(delta_req) as res:
		delta_data = json.load(res)
	
	ereter_req = urllib.request.Request(ereter_url)
	with urllib.request.urlopen(ereter_req) as res:
		soup = BeautifulSoup(res, "html.parser")
	ereter_data = [{
		"lr2_bmsid": tr("a")[1]["href"].rpartition("=")[-1],
		"level_easy": tr("td")[3]["sort-value"],
		"level_hard": tr("td")[4]["sort-value"],
		} for tr in soup.select("tbody tr")
	]
	
	easydata = apply_level(copy.deepcopy(delta_data), ereter_data, "level_easy")
	with open('easydata.json', 'w') as f:
		json.dump(easydata, f, ensure_ascii=False)
	
	harddata = apply_level(copy.deepcopy(delta_data), ereter_data, "level_hard")
	with open('harddata.json', 'w') as f:
		json.dump(harddata, f, ensure_ascii=False)

main()
