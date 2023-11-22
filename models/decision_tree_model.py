from sklearn.model_selection import GridSearchCV
from sklearn.tree import DecisionTreeClassifier
from model_utils import RANDOM_STATE, load_dataset, print_results, save_model

x_train, x_test, y_train, y_test = load_dataset()

clf = DecisionTreeClassifier(random_state=RANDOM_STATE)

param_grid = {
    'max_depth': range(1, 21, 5),
    'criterion': ['gini', 'entropy'],
}
grid = GridSearchCV(clf, param_grid, verbose=3, cv=3).fit(x_train, y_train)

print_results(grid, y_test, x_test)
save_model(grid)
