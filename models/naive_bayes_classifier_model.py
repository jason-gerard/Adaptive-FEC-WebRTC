from sklearn.model_selection import GridSearchCV
from sklearn.naive_bayes import MultinomialNB
from model_utils import load_dataset, print_results, save_model

x_train, x_test, y_train, y_test = load_dataset()

clf = MultinomialNB()

param_grid = {
    "alpha": [i / 10 for i in range(0, 12, 2)]
}
grid = GridSearchCV(clf, param_grid, verbose=3, cv=3).fit(x_train, y_train)

print_results(grid, y_test, x_test)
save_model(grid)
