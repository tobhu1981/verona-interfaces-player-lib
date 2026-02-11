// ============================================================================
// VERONA OPERATION IDS
// ============================================================================

/**
 * Verona operation IDs for all message types.
 * 
 * Use these constants instead of hardcoded strings to ensure type safety
 * and prevent typos in message handling.
 * 
 * @public
 */

export const VeronaOperations = {
  
  /** Player announces it is ready to receive commands */
  READY_NOTIFICATION: 'vopReadyNotification',
  /** Player reports state changes (responses, navigation, etc.) */
  STATE_CHANGED_NOTIFICATION: 'vopStateChangedNotification',
  /** Player requests navigation to another unit */
  UNIT_NAVIGATION_REQUESTED_NOTIFICATION: 'vopUnitNavigationRequestedNotification',
  /** Player reports a runtime error */
  RUNTIME_ERROR_NOTIFICATION: 'vopRuntimeErrorNotification',
  /** Player requests execution of a widget */
  WIDGET_CALL: 'vopWidgetCall',
  /** Player reports window focus changes */
  WINDOW_FOCUS_CHANGED_NOTIFICATION: 'vopWindowFocusChangedNotification',
  

  /** Host commands player to start with given configuration */
  START_COMMAND: 'vopStartCommand',
  /** Host commands player to navigate to a specific page */
  PAGE_NAVIGATION_COMMAND: 'vopPageNavigationCommand',
  /** Host denies a navigation request from player */
  NAVIGATION_DENIED_NOTIFICATION: 'vopNavigationDeniedNotification',
  /** Host updates player configuration */
  PLAYER_CONFIG_CHANGED_NOTIFICATION: 'vopPlayerConfigChangedNotification',
  /** Host returns result from widget execution */
  WIDGET_RETURN: 'vopWidgetReturn'
} as const;

/**
 * Union type of all valid Verona operation IDs.
 * Used for type-safe message type checking.
 * @public
 */
export type VeronaOperationId = typeof VeronaOperations[keyof typeof VeronaOperations];