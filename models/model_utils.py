import os
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
import pickle

RANDOM_STATE = 42


def load_dataset():
    x = []
    y = []
    with open("dataset.csv", "r") as f:
        for line in f:
            values = [int(value) for value in line.split(",")]

            x.append(values[4:5])  # only use the last state as input
            y.append(values[5])

    # print(x)
    # print(y)

    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33, random_state=RANDOM_STATE)
    return x_train, x_test, y_train, y_test


def print_results(grid, y_test, x_test):
    print("\n\n")
    print("=== RESULTS ===")

    print("Best parameters: {}".format(grid.best_params_))
    print("Best score: {:0.5f}".format(grid.best_score_))
    print("All model parameters: {}".format(grid.get_params()))

    preds = grid.best_estimator_.predict(x_test)
    acc_score = accuracy_score(y_test, preds)
    print(f"Accuracy on test data: {acc_score * 100} %")

    print(classification_report(y_test, preds))

    # For each model we will build a data frame of all the different combinations
    # of hyperparameters from grid search and save them to a CSV along with the
    # test data accuracy with and without tolerance scores for analysis later
    model_name = grid.get_params()["estimator"].__class__.__name__
    df = pd.concat([
        pd.DataFrame([{"Model Name": model_name}]),
        pd.DataFrame(grid.cv_results_["params"]),
        pd.DataFrame(grid.cv_results_["mean_test_score"], columns=["Accuracy"]),
    ], axis=1)
    path = os.path.join("results", f"{model_name}.csv")
    df.to_csv(path, encoding='utf-8', index=False)

    df = pd.concat([
        pd.DataFrame([{
            "Accuracy": acc_score,
            "Precision": precision_score(y_test, preds, average="macro"),
            "Recall": recall_score(y_test, preds, average="macro"),
            "F1": f1_score(y_test, preds, average="macro"),
        }]),
    ])
    df.to_csv(path, encoding='utf-8', index=False, mode='a')


def save_model(grid):
    model_name = grid.get_params()["estimator"].__class__.__name__

    with open(f"./model_binaries/{model_name}.pkl", "wb") as f:
        pickle.dump(grid.best_estimator_, f)
