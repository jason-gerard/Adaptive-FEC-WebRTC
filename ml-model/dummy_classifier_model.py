from sklearn.model_selection import GridSearchCV
from sklearn.dummy import DummyClassifier
from model_utils import RANDOM_STATE, load_dataset, print_results

x_train, x_test, y_train, y_test = load_dataset()

clf = DummyClassifier(random_state=RANDOM_STATE)

param_grid = {
    'strategy': ["most_frequent", "prior", "stratified", "uniform"],
}
grid = GridSearchCV(clf, param_grid, verbose=3, cv=3).fit(x_train, y_train)

print_results(grid, y_test, x_test)
