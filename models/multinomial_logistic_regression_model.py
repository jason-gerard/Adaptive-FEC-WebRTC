from sklearn.model_selection import GridSearchCV
from sklearn.linear_model import LogisticRegression
from model_utils import RANDOM_STATE, load_dataset, print_results, save_model
import numpy as np

x_train, x_test, y_train, y_test = load_dataset()

clf = LogisticRegression(random_state=RANDOM_STATE, multi_class='multinomial')

param_grid = {
    "C": np.logspace(-2, 2, 4),
    "penalty": ["l1", "l2"],
    "solver": ["newton-cg", "sag", "saga", "lbfgs"]
}
grid = GridSearchCV(clf, param_grid, verbose=3, cv=3).fit(x_train, y_train)

print_results(grid, y_test, x_test)
save_model(grid)
