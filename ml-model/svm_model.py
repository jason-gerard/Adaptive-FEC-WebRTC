from sklearn.model_selection import GridSearchCV
from sklearn.svm import SVC
from model_utils import RANDOM_STATE, load_dataset, print_results

x_train, x_test, y_train, y_test = load_dataset()

clf = SVC(random_state=RANDOM_STATE)

param_grid = {
    'C': [0.1, 1, 10, 100, 100],
    'gamma': [1, 0.1, 0.01, 0.001],
    'kernel': ['poly', 'rbf'],
}
grid = GridSearchCV(clf, param_grid, verbose=3, cv=3).fit(x_train, y_train)

print_results(grid, y_test, x_test)
