from sklearn.model_selection import GridSearchCV
import xgboost as xgb
from model_utils import RANDOM_STATE, load_dataset, print_results, save_model
import numpy as np

x_train, x_test, y_train, y_test = load_dataset()

max_value = len(np.unique(y_test))

clf = xgb.XGBClassifier(
    seed=RANDOM_STATE,
    random_state=RANDOM_STATE,
    objective='multi:softmax',
    num_class=max_value
)

param_grid = {
    'learning_rate': [0.01, 0.02, 0.1],
    'max_depth': [1, 2, 5, 10],
    'n_estimators': [1, 2, 5, 10],
}
grid = GridSearchCV(clf, param_grid, verbose=3, cv=3).fit(x_train, y_train)

print_results(grid, y_test, x_test)
save_model(grid)
