# Scoring service

FastAPI scoring service plus the training entrypoint that compares Logistic Regression, Gradient Boosting, XGBoost, and CatBoost on chronological validation data, saves the best candidate, and reports final Average Precision on the untouched newest 20% test set.

See the repository root `README.md` for data decisions and run commands.

## Additional pre-contact fields

The scorer accepts these optional intake-time fields: `purchase_timeframe`,
`budget_inventory_match`, `payment_method`, `purpose`,
`selected_project_or_unit_type`, `preferred_location_match`, `contact_verified`,
`has_prior_mgc_relationship`, `initial_intent_level`, and
`previous_inquiry_count`.

Add the same columns to the CRM export before retraining. Missing columns are
treated as unknown during rollout, so they will not improve the model until
historical records contain actual values. Do not populate them from events that
occur after the first sales contact.
