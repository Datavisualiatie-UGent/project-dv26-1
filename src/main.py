import csv as csv
from collections import Counter

import plt


def parse_csv(file):
    languages = []
    with open(file) as csvfile:
        reader = csv.reader(csvfile)
        header = next(reader)

        for row in reader:
            if len(row) != len(header):
                raise IndexError("bad csv")

            languages.append({})
            for i, head in enumerate(header):
                languages[-1][head] = row[i]

        return languages


def clean_languages(languages):
    cleaned_languages = []
    for language in languages:

        # legacy language entries, split into multiple languages or merged with others
        if language["family"] == "Bookkeeping":
            continue

        # split macroarea list
        if ";" in language["macroarea"]:
            for macroarea in language["macroarea"].split(";"):
                new_language = language
                new_language["macroarea"] = macroarea
                cleaned_languages.append(new_language)
        else:
            cleaned_languages.append(language)

    return cleaned_languages


def plot_feature(languages, feature):
    features = Counter(language[feature] for language in languages)
    features_sorted = sorted(features.items(), key=lambda x: x[1], reverse=True)
    features, counts = zip(*features_sorted[0:20])
    print(counts)

    fig, ax = plt.subplots(figsize=(8, 8))
    fig.subplots_adjust(left=0.3, bottom=0.1, right=0.95, top=0.9)

    ax.barh(features, counts)
    fig.show()


def join_family_table(languages, families):
    for language in languages:
        id = language["family_id"]
        for family in families:
            if id == family["id"]:
                id = family["family"]
        language["family"] = id
        del language["family_id"]

def join_endangeredness(languages, endangeredness):
    for language in languages:
        id = language["id"]
        for _endangeredness in endangeredness:
            if id == _endangeredness["id"]:
                language["endangeredness_status_code"] = _endangeredness["status_code"]
                language["endangeredness_status_label"] = _endangeredness["status_label"]
            else:
                language["endangeredness_status_code"] = -1
                language["endangeredness_status_label"] = "not data"


def main():
    languages = parse_csv("../data/talen")
    families = parse_csv("../data/families")
    join_family_table(languages, families)
    languages = clean_languages(languages)
    plot_feature(languages, "macroarea")
    plot_feature(languages, "family")

def combine_data():
    languages = parse_csv("../data/talen")
    families = parse_csv("../data/families")
    endangeredness = parse_csv("../data/bedreigdheid")
    print(endangeredness[0:5])
    join_endangeredness(languages, endangeredness)
    join_family_table(languages, families)
    languages = clean_languages(languages)
    with open("../data/dataset", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=languages[0].keys())
        writer.writeheader()
        writer.writerows(languages)



if __name__ == '__main__':
    combine_data()
