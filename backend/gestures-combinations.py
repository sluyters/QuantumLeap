from itertools import combinations

THRESHOLD = 0

# # UD-time_gating-all_antennas (all gestures)
# confusion_matrix = [
#   [55, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
#   [3, 51, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
#   [2, 1, 53, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0],
#   [0, 0, 0, 58, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
#   [0, 0, 0, 0, 59, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
#   [0, 0, 0, 1, 0, 54, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
#   [0, 0, 0, 0, 1, 7, 51, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
#   [0, 2, 2, 0, 0, 0, 0, 54, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
#   [0, 0, 0, 0, 0, 0, 0, 1, 52, 0, 0, 0, 2, 1, 1, 3, 0, 0, 0, 0],
#   [0, 0, 0, 0, 1, 0, 0, 0, 0, 56, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0],
#   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 57, 1, 0, 0, 0, 0, 0, 1, 0, 1],
#   [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 56, 0, 0, 0, 0, 1, 0, 1, 1],
#   [0, 2, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 44, 9, 2, 1, 0, 0, 0, 0],
#   [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 3, 46, 5, 5, 0, 0, 0, 0],
#   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 57, 0, 0, 0, 0, 0],
#   [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 2, 4, 52, 0, 0, 0, 0],
#   [0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 1, 1, 0, 0, 55, 0, 0, 0],
#   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 59, 0, 0],
#   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 59, 0],
#   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 59]
# ]

# UD-filtering-all_antennas (all gestures)
confusion_matrix = [
  [29, 4, 4, 2, 2, 2, 7, 1, 1, 0, 0, 1, 1, 4, 0, 1, 0, 0, 0, 1],
  [2, 30, 5, 1, 2, 0, 1, 3, 5, 1, 0, 2, 2, 3, 1, 0, 1, 0, 0, 1],
  [4, 8, 26, 2, 1, 3, 1, 0, 1, 0, 0, 1, 0, 3, 2, 3, 1, 1, 2, 1],
  [1, 1, 2, 27, 2, 1, 3, 0, 1, 5, 1, 5, 1, 3, 1, 0, 3, 0, 1, 2],
  [3, 1, 0, 2, 27, 5, 3, 2, 0, 2, 1, 2, 0, 2, 1, 1, 4, 2, 0, 2],
  [0, 1, 4, 1, 4, 21, 7, 0, 3, 2, 0, 1, 1, 1, 0, 3, 2, 4, 2, 3],
  [3, 1, 2, 1, 1, 4, 36, 0, 3, 0, 1, 2, 0, 2, 1, 1, 0, 0, 0, 2],
  [2, 5, 1, 1, 3, 0, 1, 16, 2, 2, 1, 0, 6, 6, 3, 1, 7, 1, 1, 1],
  [4, 1, 1, 0, 0, 2, 2, 0, 34, 1, 0, 0, 0, 0, 2, 8, 2, 0, 1, 2],
  [0, 0, 1, 2, 1, 3, 5, 1, 4, 25, 3, 1, 2, 1, 0, 2, 1, 3, 4, 1],
  [1, 0, 0, 0, 4, 2, 0, 1, 0, 10, 31, 1, 0, 1, 1, 0, 3, 3, 2, 0],
  [1, 2, 1, 2, 1, 1, 6, 0, 6, 3, 2, 21, 0, 0, 2, 0, 1, 1, 3, 7],
  [3, 2, 1, 0, 0, 1, 0, 4, 2, 2, 1, 0, 15, 12, 7, 2, 5, 1, 1, 1],
  [2, 4, 2, 3, 1, 1, 0, 4, 1, 0, 0, 0, 7, 25, 4, 3, 2, 0, 0, 1],
  [0, 1, 3, 2, 1, 2, 2, 0, 0, 1, 0, 0, 4, 5, 26, 8, 3, 0, 1, 1],
  [1, 0, 1, 1, 1, 0, 6, 0, 6, 0, 0, 0, 1, 5, 6, 28, 2, 1, 0, 1],
  [1, 1, 3, 2, 1, 2, 1, 2, 1, 1, 0, 0, 5, 2, 4, 0, 31, 2, 1, 0],
  [1, 0, 0, 1, 2, 3, 0, 0, 2, 2, 2, 2, 0, 3, 2, 2, 1, 35, 1, 1],
  [1, 0, 0, 1, 2, 0, 3, 1, 1, 0, 4, 1, 0, 2, 0, 6, 2, 1, 34, 1],
  [3, 1, 1, 2, 5, 3, 1, 0, 2, 1, 1, 5, 2, 0, 0, 2, 1, 2, 3, 25]
]

# # Mixed-time_gating-all_antennas (all gestures)
# confusion_matrix = [

# ]

# # Mixed-filtering-all_antennas (all gestures)
# confusion_matrix = [

# ]


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
    total_confusion = 0
    is_ok = True
    for gestures_pair in combinations(gestures_combination, 2):
      v1 = confusion_matrix[gestures_pair[0] - 1][gestures_pair[1] - 1]
      v2 = confusion_matrix[gestures_pair[1] - 1][gestures_pair[0] - 1]
      if v1 > THRESHOLD or v2 > THRESHOLD:
        is_ok = False
        break
      total_confusion = total_confusion + v1 + v2
    if is_ok:
      # print(gestures_combination, total_confusion)
      best_combinations.append((gestures_combination, total_confusion))


# Re-order combinations
best_combinations.sort(key=lambda item: (len(item[0]), -item[1]))
for combination in best_combinations:
  print(combination[0], len(combination[0]), combination[1])

