from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from model_utils import RANDOM_STATE, load_dataset, print_results, save_model

x_train, x_test, y_train, y_test = load_dataset()

clf = RandomForestClassifier(random_state=RANDOM_STATE)

param_grid = {
    'n_estimators': [1, 2, 5, 10, 20, 30, 50],
    'max_depth': [1, 2, 3, 5, 10, 20],
    'criterion': ['gini', 'entropy'],
}
grid = GridSearchCV(clf, param_grid, verbose=3, cv=3).fit(x_train, y_train)

print_results(grid, y_test, x_test)
save_model(grid)
