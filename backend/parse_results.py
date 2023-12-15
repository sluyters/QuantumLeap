import statistics
import json
import seaborn as sn
import pandas as pd
import matplotlib
import matplotlib.pyplot as plt
import os
import sys

matplotlib.use('pdf')

# File to process
# All
input_files = [
    # './Testing IEEE Sensors 2023 - LOOCV - Re-ordered matrices/UD-time_gating-all_antennas-(1, 4, 7, 8, 10, 14, 18, 19).json',
    # './Testing IEEE Sensors 2023 - LOOCV - Re-ordered matrices/UD-time_gating-all_antennas-(1, 4, 7, 8, 10, 14, 19, 20).json',
    # './Testing IEEE Sensors 2023 - LOOCV - Re-ordered matrices/UD-time_gating-all_antennas-(2, 4, 5, 6, 9, 10, 11, 15, 17, 18, 19, 20).json',
    # './Testing IEEE Sensors 2023 - LOOCV - Re-ordered matrices/UD-time_gating-all_antennas-(2, 4, 5, 7, 9, 10, 11, 15, 17, 18, 19, 20).json'
    # './Testing IEEE Sensors 2023 - LOOCV - Re-ordered matrices/UD-filtering-all_antennas-2_11_16.json',
    # './Testing IEEE Sensors 2023 - LOOCV - Re-ordered matrices/UD-filtering-all_antennas-2_4_11_16.json'
    # './Materials radar recognition/bgsub-fd/pvc-only TTS UD.json',
    # Through materials
    # './Thesis2023 - Through-materials/glass-only LOOCV UD.json',
    # './Thesis2023 - Through-materials/glass-pvc LOOCV UD.json',
    # './Thesis2023 - Through-materials/glass-wood LOOCV UD.json',
    # './Thesis2023 - Through-materials/pvc-glass LOOCV UD.json',
    # './Thesis2023 - Through-materials/pvc-only LOOCV UD.json',
    # './Thesis2023 - Through-materials/pvc-wood LOOCV UD.json',
    # './Thesis2023 - Through-materials/wood-glass LOOCV UD.json',
    # './Thesis2023 - Through-materials/wood-only LOOCV UD.json',
    # './Thesis2023 - Through-materials/wood-pvc LOOCV UD.json',
    # Sensors comparison
    './IUI2022 + Tiis - Sensors comparison/results IUI2022 + TiiS LMC (Walabot).json',
    './IUI2022 + Tiis - Sensors comparison/results IUI2022 + TiiS Walabot (freq model, bg_sub).json',
    './IUI2022 + Tiis - Sensors comparison/results IUI2022 + TiiS Walabot (freq no_model, no_bg_sub).json',
    './IUI2022 + Tiis - Sensors comparison/results IUI2022 + TiiS Walabot (inversion model, bg_sub, median_filter_window 8, of 10e12, eps 1.10).json',
    './IUI2022 + Tiis - Sensors comparison/results IUI2022 + TiiS Walabot (inversion, model, bg_sub, no_filter).json',
    './IUI2022 + Tiis - Sensors comparison/results IUI2022 LMC (VNA).json',
    './IUI2022 + Tiis - Sensors comparison/results IUI2022 VNA (freq model, bg_sub).json',
    './IUI2022 + Tiis - Sensors comparison/results IUI2022 VNA (freq model, no_bg_sub).json',
    './IUI2022 + Tiis - Sensors comparison/results IUI2022 VNA (freq no_model, no_bg_sub).json',
    './IUI2022 + Tiis - Sensors comparison/results IUI2022 VNA (inversion model, bg_sub, median_filter_window 8, of 10e12, eps 1.10).json',
    './IUI2022 + Tiis - Sensors comparison/results IUI2022 VNA (inversion, model, bg_sub, no_filter).json',
]

# Gesture names (leave empty to keep default) 
# ORDER values must start at 0 and be consecutive!
gestures_map = {
    # Through materials
    # '1': { 'order': 6, 'name': 'p' }, # Push palm
    # '2': { 'order': 7, 'name': 'q' }, # Pull palm
    # '3': { 'order': 5, 'name': 'o' }, # Push fist
    # '4': { 'order': 2, 'name': 'h' }, # Swipe right
    # '5': { 'order': 3, 'name': 'i' }, # Swipe left
    # '6': { 'order': 8, 'name': 't' }, # Knock 3 times
    # '7': { 'order': 4, 'name': 'l' }, # Draw infinity
    # '8': { 'order': 0, 'name': 'a' }, # Open hand
    # '9': { 'order': 1, 'name': 'b' }, # Close hand

    # Sensors comparison + 20 gestures
    '1': { 'order': 0, 'name': 'a' },
    '2': { 'order': 1, 'name': 'b' },
    '3': { 'order': 2, 'name': 'c' },
    '4': { 'order': 7, 'name': 'h' },
    '5': { 'order': 8, 'name': 'i' },
    '6': { 'order': 9, 'name': 'j' },
    '7': { 'order': 10, 'name': 'k' },
    '8': { 'order': 14, 'name': 'o' },
    '9': { 'order': 15, 'name': 'p' },
    '10': { 'order': 16, 'name': 'r' },
    '11': { 'order': 11, 'name': 'l' },
    '12': { 'order': 18, 'name': 'u' },
    '13': { 'order': 3, 'name': 'd' },
    '14': { 'order': 4, 'name': 'e' },
    '15': { 'order': 5, 'name': 'f' },
    '16': { 'order': 6, 'name': 'g' },
    '17': { 'order': 17, 'name': 's' },
    '18': { 'order': 12, 'name': 'm' },
    '19': { 'order': 13, 'name': 'n' },
    '20': { 'order': 19, 'name': 'v' },

    # '1': { 'order': 0, 'name': 'a' },
    # '2': { 'order': 1, 'name': 'b' },
    # '3': { 'order': 2, 'name': 'c' },
    # '4': { 'order': 7, 'name': 'h' },
    # '5': { 'order': 8, 'name': 'i' },
    # '6': { 'order': 9, 'name': 'j' },
    # '7': { 'order': 10, 'name': 'k' },
    # '8': { 'order': 14, 'name': 'o' },
    # '9': { 'order': 15, 'name': 'p' },
    # '10': { 'order': 16, 'name': 'q' },
    # '11': { 'order': 11, 'name': 'l' },
    # '12': { 'order': 18, 'name': 's' },
    # '13': { 'order': 3, 'name': 'd' },
    # '14': { 'order': 4, 'name': 'e' },
    # '15': { 'order': 5, 'name': 'f' },
    # '16': { 'order': 6, 'name': 'g' },
    # '17': { 'order': 17, 'name': 'r' },
    # '18': { 'order': 12, 'name': 'm' },
    # '19': { 'order': 13, 'name': 'n' },
    # '20': { 'order': 19, 'name': 't' },
}
# gestures_map = {}









def getDirName(path):
    extension = ""
    index = 0
    while True:
        newPath = path + extension
        if not os.path.exists(newPath):
            return newPath
        index += 1
        extension = ' ({0})'.format(index)
    return 


for input_file in input_files:
    # Open results and parse json file
    file = open(input_file)
    results = json.load(file)
    # Get current working directory
    path = getDirName(os.path.join(os.getcwd(), "results"))
    os.mkdir(path)


    # For each dataset
    for dataset in results:
        datasetsNames = dataset['datasets']
        gestures = dataset['gestures']
        repetitions = dataset['r']
        if not isinstance(repetitions, list):
            repetitions = [repetitions] * len(gestures)
        # Create new sub gesture map if necessary
        sub_gestures_map = {}
        if len(gestures_map) > 0:
            try:
                for gesture in gestures:
                    sub_gestures_map[gesture] = gestures_map[gesture]
            except:
                print('Incompatible gestures map!')
                sub_gestures_map = {}
        # Generate gesture index and helper LUTs for matrix reordering
        reordering_lut = []
        gestures_index = gestures
        if sub_gestures_map:
            sorted_sub_gestures_map = list(sub_gestures_map.items())
            sorted_sub_gestures_map.sort(key=lambda item : item[1]['order'])
            gestures_index = [item[1]['name'] for item in sorted_sub_gestures_map]
            reordering_lut = [{ 'oldId': gestures.index(item[0]), 'newId': id } for id, item in enumerate(sorted_sub_gestures_map)]
            repetitions = [repetitions[item_correspondance['oldId']] for item_correspondance in reordering_lut]
        
        
        data = dataset['data']
        # Create directory for the results of this dataset
        datasetPath = getDirName(os.path.join(path, ', '.join(datasetsNames)))
        os.mkdir(datasetPath)
        # Create a file with informations about the dataset
        with open(os.path.join(datasetPath, 'dataset-info.json'), 'w+') as outfile:
            json.dump([gestures, gestures_index], outfile)

        # Create a file with testing summary
        original_stdout = sys.stdout
        with open(os.path.join(datasetPath, 'testing-summary.txt'), 'w') as summaryfile:
            # sys.stdout = summaryfile
            # For each recognizer
            for recognizer in data:
                recognizerName = recognizer['name']
                options = recognizer['options']
                benchmarks = recognizer['data']
                print('='*50)
                print('{0}\nOPTIONS: {1}'.format(recognizerName, options))
                print('-'*50)
                # Create directory for the results of this recognizer
                recognizerPath = getDirName(os.path.join(datasetPath, recognizerName))
                os.mkdir(recognizerPath)
                # Create a file with informations about the dataset
                with open(os.path.join(recognizerPath, 'recognizer-info.json'), 'w+') as outfile:
                    json.dump(options, outfile)
                # For each number of templates
                for benchmark in benchmarks:
                    # Confusion matrix
                    confusionMatrix = benchmark['confusionMatrix']

                    # Reorder elements in the matrix
                    if reordering_lut:
                        lines = []
                        confusionMatrix = [
                            [
                                confusionMatrix[item_correspondance_rows['oldId']][item_correspondance_cols['oldId']] 
                                for item_correspondance_cols in reordering_lut
                            ] 
                            for item_correspondance_rows in reordering_lut
                        ]

                    trial_params = [str(item) for item in benchmark.items() if item[0] not in ['accuracy', 'time', 'confusionMatrix']]
                    trial_params_str = '-'.join(trial_params)

                    confusionMatrix = [ [ (elem / repetitions[index]) * 100 for elem in line ] for index, line in enumerate(confusionMatrix) ]
                    df_cm = pd.DataFrame(confusionMatrix, index = gestures_index, columns = gestures_index)
                    plt.figure()
                    sn.set(font_scale=1) # for label size
                    sn.heatmap(df_cm, annot=True, annot_kws={"size": 8}, fmt='.1f', cmap='Blues', vmin=0, vmax=100)
                    plt.xlabel('Predicted', labelpad=10, fontsize=12, fontweight='bold') 
                    plt.ylabel('Actual', labelpad=10, fontsize = 12, fontweight='bold') 
                    fileName = '{0}-cm.pdf'.format(trial_params_str)
                    plt.savefig(os.path.join(recognizerPath, fileName), dpi=300, bbox_inches = "tight")
                    plt.close()
                    # General data
                    print('Trial params: {0}'.format(trial_params_str))
                    classAccuracies = []
                    for index, line in enumerate(confusionMatrix):
                        accuracy = line[index]
                        # accuracy = (correct/repetitions[index]) * 100
                        classAccuracies.append(accuracy)
                        print('Gesture class {0} - Accuracy: {1:.2f}%'.format(gestures_index[index], accuracy))
                    print('Global accuracy: {0:.2f}% - Stdev: {1:.2f} - Variance: {2:.2f}\n'.format(statistics.mean(classAccuracies), statistics.stdev(classAccuracies), statistics.variance(classAccuracies)))
                    # Bar plot
                    plt.figure()
                    plt.bar(gestures_index, classAccuracies, width=0.8, bottom=None, align='center', color=(0.24, 0.55, 0.76, 1), data=None)
                    plt.xlabel('Gesture class', labelpad=10, fontsize=12, fontweight='bold')
                    plt.xticks(rotation=90)
                    plt.ylabel('Accuracy [%]', labelpad=10, fontsize = 12, fontweight='bold')
                    plt.ylim(0, 100) 
                    fileName = '{0}-bar.pdf'.format(trial_params_str)
                    plt.savefig(os.path.join(recognizerPath, fileName), dpi=300, bbox_inches = "tight")
                    plt.close()
        original_stdout = sys.stdout

    file.close()