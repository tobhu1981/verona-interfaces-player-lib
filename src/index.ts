// ============================================================================
// @verona/interfaces
// TypeScript Library für Verona Player und Editor Interfaces
// ============================================================================

// Constants (not exported by default, use specific imports if needed)
export { DEFAULT_TARGET_ORIGIN, MIN_SHARED_PARAMETER_KEY_LENGTH, VERONA_SPEC_VERSION} from './constants';

// Types
export * from './types';

// Utilities
export * from './utils';

// Player
export { VeronaPlayerApiService } from './services/VeronaPlayerApiService';
export type {
  VeronaPlayerOptions,
  StartCommandData,
  PageNavigationCommandData,
  NavigationDeniedNotificationData,
  PlayerConfigChangedNotificationData,
  WidgetReturnData
} from './services/VeronaPlayerApiService';

// ============================================================================
// CONVENIENCE TYPE EXPORTS - Direct access to commonly used types
// ============================================================================

// Direct exports from MainSchema
export type UnitState = MainSchema.UnitState;
export type PlayerConfig = MainSchema.PlayerConfig;
export type PlayerState = MainSchema.PlayerState;
export type LogEntry = MainSchema.LogEntry;
export type NavigationTarget = MainSchema.NavigationTarget;
export type SessionIdString = MainSchema.SessionIdString;
export type SharedParameter = MainSchema.SharedParameter;
export type WidgetParameter = MainSchema.WidgetParameter;

// Direct exports from PayloadInterfacesProperties.PlayerReceive
export type StartCommand = PayloadInterfacesProperties.PlayerReceive.StartCommand;
export type PageNavigationCommand = PayloadInterfacesProperties.PlayerReceive.PageNavigationCommand;
export type NavigationDeniedNotification = PayloadInterfacesProperties.PlayerReceive.NavigationDeniedNotification;
export type PlayerConfigChangedNotification = PayloadInterfacesProperties.PlayerReceive.PlayerConfigChangedNotification;
export type WidgetReturn = PayloadInterfacesProperties.PlayerReceive.WidgetReturn;

// Direct exports from PayloadInterfacesProperties.PlayerSend
export type ReadyNotification = PayloadInterfacesProperties.PlayerSend.ReadyNotification;
export type StateChangedNotification = PayloadInterfacesProperties.PlayerSend.StateChangedNotification;
export type UnitNavigationRequestedNotification = PayloadInterfacesProperties.PlayerSend.UnitNavigationRequestedNotification;
export type RuntimeErrorNotification = PayloadInterfacesProperties.PlayerSend.RuntimeErrorNotification;
export type WidgetCall = PayloadInterfacesProperties.PlayerSend.WidgetCall;
export type WindowFocusChangedNotification = PayloadInterfacesProperties.PlayerSend.WindowFocusChangedNotification;

// Direct exports from AllowedPropertiesValues
export type Progress = AllowedPropertiesValues.Progress;
export type LogPolicy = AllowedPropertiesValues.LogPolicy;
export type PagingMode = AllowedPropertiesValues.PagingMode;
export type PrintMode = AllowedPropertiesValues.PrintMode;
export type NavigationDenialReason = AllowedPropertiesValues.NavigationDenialReason;
export type WidgetType = AllowedPropertiesValues.WidgetType;
export type ErrorCode = AllowedPropertiesValues.Code;

import { MainSchema, PayloadInterfacesProperties, AllowedPropertiesValues } from './types';