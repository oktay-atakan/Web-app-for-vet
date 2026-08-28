// PUT payloads distinguish three states for an optional field: omitted
// (undefined -> keep the existing value, for real partial updates),
// explicitly cleared (empty string -> store null), or a real new value.
function resolveOptionalField (newValue, existingValue) {
  if (newValue === undefined) {
    return existingValue;
  }
  return newValue === '' ? null : newValue;
}

module.exports = resolveOptionalField;