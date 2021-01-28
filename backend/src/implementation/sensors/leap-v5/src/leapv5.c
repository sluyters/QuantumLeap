#include <node_api.h>

/*
 * A function of the API
 */
napi_value MyFunction(napi_env env, napi_callback_info info) {
  napi_status status;
  // Expected number of arguments
  size_t argc = 1;
  // List of arguments
  napi_value argv[1];
  // Retrieve arguments into argv
  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Failed to parse arguments");
  }
  // Convert argument into int
  int number = 0;
  status = napi_get_value_int32(env, argv[0], &number);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Invalid number was passed as argument");
  }

  // Compute value and convert into napi_value
  napi_value myNumber;
  number = number * 2;
  status = napi_create_int32(env, number, &myNumber);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to create return value");
  }
  return myNumber;
}

/*
 * Module initialization
 */
napi_value Init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value fn;

  // Arguments 2 and 3 are function name and length respectively
  // We will leave them as empty for this example
  status = napi_create_function(env, NULL, 0, MyFunction, NULL, &fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to wrap native function");
  }

  // Add the function to our exports
  status = napi_set_named_property(env, exports, "my_function", fn);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "Unable to populate exports");
  }

  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)