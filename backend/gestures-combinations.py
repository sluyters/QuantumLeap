from itertools import combinations

THRESHOLD = 3

confusion_matrix = [
  [65, 0, 4, 3, 1, 0, 4, 1, 1, 1, 1, 2, 4, 2, 0, 3, 0, 3, 0, 5],
  [1, 62, 7, 4, 1, 1, 1, 4, 1, 4, 5, 0, 0, 0, 1, 1, 2, 2, 0, 3],
  [0, 5, 62, 3, 0, 1, 1, 0, 2, 7, 6, 0, 0, 0, 2, 2, 5, 3, 0, 1],
  [3, 8, 2, 59, 1, 0, 0, 4, 0, 5, 1, 0, 3, 1, 0, 2, 2, 6, 1, 2],
  [2, 2, 2, 5, 40, 5, 5, 5, 2, 4, 6, 5, 2, 1, 5, 2, 2, 1, 2, 2],
  [2, 4, 0, 3, 7, 55, 3, 3, 2, 2, 1, 2, 1, 4, 1, 3, 2, 0, 3, 2],
  [1, 1, 2, 8, 2, 6, 50, 2, 2, 6, 2, 2, 1, 1, 3, 2, 4, 2, 2, 1],
  [1, 1, 0, 1, 1, 2, 8, 67, 3, 0, 4, 1, 0, 4, 3, 1, 1, 1, 0, 1],
  [1, 3, 3, 0, 4, 0, 6, 3, 52, 4, 4, 2, 1, 6, 2, 2, 2, 2, 2, 1],
  [0, 5, 2, 1, 1, 1, 2, 3, 2, 66, 5, 1, 4, 1, 1, 0, 2, 1, 0, 2],
  [2, 3, 2, 0, 2, 3, 1, 1, 5, 3, 65, 0, 0, 1, 2, 3, 3, 4, 0, 0],
  [2, 3, 1, 2, 0, 2, 2, 5, 4, 4, 2, 55, 1, 2, 1, 4, 2, 1, 4, 3],
  [9, 6, 1, 7, 0, 2, 0, 1, 0, 4, 3, 0, 42, 5, 1, 4, 7, 3, 0, 5],
  [8, 2, 4, 1, 2, 1, 6, 2, 2, 1, 4, 3, 1, 47, 1, 4, 5, 2, 1, 3],
  [4, 3, 4, 0, 1, 1, 1, 5, 3, 5, 3, 4, 3, 3, 51, 3, 1, 2, 1, 2],
  [3, 3, 3, 1, 1, 1, 1, 1, 1, 9, 2, 1, 7, 2, 1, 50, 8, 2, 0, 3],
  [1, 3, 3, 5, 2, 5, 1, 2, 3, 5, 1, 0, 6, 0, 1, 1, 47, 8, 0, 6],
  [4, 2, 0, 4, 3, 1, 2, 1, 0, 4, 3, 0, 1, 0, 1, 2, 1, 70, 0, 1],
  [3, 1, 3, 1, 4, 4, 6, 6, 2, 4, 1, 8, 1, 1, 1, 1, 4, 5, 42, 2],
  [8, 8, 1, 1, 2, 1, 2, 7, 3, 3, 3, 0, 0, 1, 2, 1, 6, 4, 2, 45]
]

# for threshold in THRESHOLDS:
#     for id_gesture, gesture_line in enumerate(confusion_matrix):
#         for id_conflict, conflict in enumerate(gesture_line):
#             if conflict <= threshold and id_gesture != id_conflict:
#                 # Bad combination
#                 print(id_gesture + 1, id_conflict + 1)



gestures = range(1, len(confusion_matrix) + 1)

# B- Loop through all combinations of antenna IDs
best_combinations = []
# 1- Loop through all set sizes
for set_size in range(2, len(confusion_matrix) + 1):
  # 2- Loop through all sets of that size
  for gestures_combination in combinations(gestures, set_size):
    # 3- Check the maximum number of confusions between two gestures in the set
    is_ok = True
    for gestures_pair in combinations(gestures_combination, 2):
      v1 = confusion_matrix[gestures_pair[0] - 1][gestures_pair[1] - 1]
      v2 = confusion_matrix[gestures_pair[1] - 1][gestures_pair[0] - 1]
      if v1 >= THRESHOLD or v2 >= THRESHOLD:
        is_ok = False
        break
    
    if is_ok:
      print(gestures_combination)
      best_combinations.append(gestures_combination)

