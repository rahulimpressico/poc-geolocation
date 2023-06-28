import json


file = open("test.json")
data = json.load(file)
# for i in data:

#     lat = i['raw_value']['LATITUDE']
#     custom_id = i["custom_field"]
#     if len(lat) >= 10:
#         # print("dublicate:",i)
#         pass
# else:
#     print("non dublicate:",i)
# with open("myData.json", 'a') as file:
#     json.dump(i, file, indent=6)


custom_field_counts = {}
unique_data = set()

for i in data:
    lat = i['raw_value']['LATITUDE']
    custom_id = i["custom_field"]

    # if len(lat) >= 5:
    if custom_id in custom_field_counts:
        custom_field_counts[custom_id] += 1
    else:
        custom_field_counts[custom_id] = 1

for i in data:
    custom_id = i["custom_field"]
    if custom_id in custom_field_counts and custom_field_counts[custom_id] > 1:
        unique_data.add(json.dumps(i))

with open("myData2.json", 'a') as file:
    new_unique = set()
    for data_item in unique_data:
        # print(data_item)
        new_unique.add(data_item)
    for my in new_unique:
        # print(my)
        file.write(my + '\n'+',')

        # json.dump(data, file, indent=6)
