<?php
/**
 * @file
 * Provides Custom Formatters integration with the User displays module.
 */

/**
 * Implements hook_type_alter().
 */
function ud_custom_formatters_fields_alter(&$fields) {
  foreach (module_implements('ds_api') as $module) {
    $api_info = ds_api_info($module);
    $extra = array();
    foreach ($api_info['extra'] as $key) {
      $extra[$key] = 1;
    }
    foreach (ds_get_fields('ud', NULL, NULL, $extra) as $key => $field) {
      if ($field['type'] == DS_FIELD_TYPE_THEME || $field['type'] == DS_FIELD_TYPE_CODE) {
        $fields['ud_' . $key] = array(
          'label' => $field['title'],
          'module' => 'ud',
        );
      }
    }
  }
}

/**
 * Implements hook_type_alter().
 */
function ud_custom_formatters_formatter_element_alter(&$element) {
  if (isset($element['module']) && $element['module'] == 'ud') {
    // Rebuild element.
    $element = array(
      '#formatter' => drupal_substr($element['formatter'], 28),
      '#user' => $element['object'],
      '#type_name' => $element['type'],
      '#field_name' => $element['key'],
      '#weight' => NULL,
      '#theme' => $element['formatter'],
      '#item' => (array) $element['object'],
    );
  }
}
