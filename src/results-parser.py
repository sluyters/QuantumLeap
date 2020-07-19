import statistics
import json
import seaborn as sn
import pandas as pd
import matplotlib.pyplot as plt
import os

# # Legend
# legend = ["C", "down", "fist_moved", "five", "four", "hang", "heavy", "index", "L", "ok", "palm", "palm_m", "palm_u", "three", "two", "up"]

# # Open results and parse json file
# file = open('results/results.json')
# results = json.load(file)

# for benchmark in results:
#     confusion_matrix = benchmark['data']['confusionMatrix']
#     df_cm = pd.DataFrame(confusion_matrix, index = legend, columns = legend)
#     plt.figure()
#     #plt.figure(figsize = (10,7))
#     sn.set(font_scale=1) # for label size
#     sn.heatmap(df_cm, annot=True, annot_kws={"size": 8}, fmt='g', cmap='Blues')
#     plt.savefig('results/{0}.png'.format(benchmark['name']), dpi=300, bbox_inches = "tight")
#     plt.close()
#     print(benchmark['name'])
#     class_accuracies = []
#     for index, line in enumerate(confusion_matrix):
#         correct = line[index]
#         total = sum(line)
#         accuracy = (correct/total) * 100
#         class_accuracies.append(accuracy)
#         print('Gesture class {0} - Accuracy: {1:.2f}%'.format(legend[index], accuracy))
#     print('Global accuracy: {0:.2f}% - Stdev: {1:.2f} - Variance: {2:.2f}'.format(statistics.mean(class_accuracies), statistics.stdev(class_accuracies), statistics.variance(class_accuracies)))

# file.close()

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


# Open results and parse json file
file = open('results-gestures.json')
results = json.load(file)
# Get current working directory
path = getDirName(os.path.join(os.getcwd(), "results"))
os.mkdir(path)


# For each dataset
for dataset in results:
    datasetName = dataset['dataset']
    gestures = dataset['gestures']
    data = dataset['data']
    # Create directory for the results of this dataset
    datasetPath = getDirName(os.path.join(path, datasetName))
    os.mkdir(datasetPath)
    # Create a file with informations about the dataset
    with open(os.path.join(datasetPath, 'dataset-info.json'), 'w') as outfile:
        json.dump(gestures, outfile)
    # For each recognizer
    for recognizer in data:
        recognizerName = recognizer['name']
        options = recognizer['options']
        benchmarks = recognizer['data']
        # Create directory for the results of this recognizer
        recognizerPath = getDirName(os.path.join(datasetPath, recognizerName))
        os.mkdir(recognizerPath)
        # Create a file with informations about the dataset
        with open(os.path.join(recognizerPath, 'recognizer-info.json'), 'w') as outfile:
            json.dump(options, outfile)
        # For each number of templates
        for benchmark in benchmarks:
            # Confusion matrix
            confusionMatrix = benchmark['confusionMatrix']
            df_cm = pd.DataFrame(confusionMatrix, index = gestures, columns = gestures)
            plt.figure()
            sn.set(font_scale=1) # for label size
            sn.heatmap(df_cm, annot=True, annot_kws={"size": 8}, fmt='g', cmap='Blues')
            plt.xlabel('Predicted', labelpad=10, fontsize=12, fontweight='bold') 
            plt.ylabel('Actual', labelpad=10, fontsize = 12, fontweight='bold') 
            fileName = '{0}-cm.pdf'.format(benchmark['n'])
            plt.savefig(os.path.join(recognizerPath, fileName), dpi=300, bbox_inches = "tight")
            plt.close()
            # General data
            print('{0} - N={1}'.format(recognizerName, benchmark['n']))
            classAccuracies = []
            for index, line in enumerate(confusionMatrix):
                correct = line[index]
                total = sum(line)
                accuracy = (correct/total) * 100
                classAccuracies.append(accuracy)
                print('Gesture class {0} - Accuracy: {1:.2f}%'.format(gestures[index], accuracy))
            print('Global accuracy: {0:.2f}% - Stdev: {1:.2f} - Variance: {2:.2f} - Time: {3:.2f}'.format(statistics.mean(classAccuracies), statistics.stdev(classAccuracies), statistics.variance(classAccuracies), benchmark['time']))
            # Bar plot
            plt.figure()
            plt.bar(gestures, classAccuracies, width=0.8, bottom=None, align='center', color=(0.24, 0.55, 0.76, 1), data=None)
            plt.xlabel('Gesture class', labelpad=10, fontsize=12, fontweight='bold')
            plt.xticks(rotation=90)
            plt.ylabel('Accuracy [%]', labelpad=10, fontsize = 12, fontweight='bold')
            plt.ylim(0, 100) 
            fileName = '{0}-bar.pdf'.format(benchmark['n'])
            plt.savefig(os.path.join(recognizerPath, fileName), dpi=300, bbox_inches = "tight")
            plt.close()

file.close()
        
            