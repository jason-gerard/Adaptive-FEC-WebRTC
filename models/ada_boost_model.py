from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import AdaBoostClassifier
from model_utils import RANDOM_STATE, load_dataset, print_results, save_model

x_train, x_test, y_train, y_test = load_dataset()

clf = AdaBoostClassifier(random_state=RANDOM_STATE)

param_grid = {
    'learning_rate': [0.1, 0.6, 0.8, 1.0],
    'n_estimators': [1, 2, 5, 10],
}
grid = GridSearchCV(clf, param_grid, verbose=3, cv=3).fit(x_train, y_train)

print_results(grid, y_test, x_test)
save_model(grid)
