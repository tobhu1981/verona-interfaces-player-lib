// ============================================================================
// VERONA PAYLOAD INTERFACES
// ============================================================================

import { MainSchema } from './schemas';
import { AllowedPropertiesValues } from './values';

/**
 * Namespace containing all message payload interfaces.
 * These define the structure of data sent in Verona messages.
 * @public
 */
export namespace PayloadInterfacesProperties {

  /** Namespace containing all player receives payloads @public*/
  export namespace PlayerReceive {

    /** vopStartCommand - Host->Player: Host starts the player @public*/
    export interface StartCommand {
      sessionId: MainSchema.SessionIdString;
      unitDefinition?: string; // base64 encoded
      unitDefinitionType?: string;
      unitState?: MainSchema.UnitState;
      playerConfig?: MainSchema.PlayerConfig;
    }

  /** vopPageNavigationCommand - Host->Player: Host requests page navigation @public*/
    export interface PageNavigationCommand {
      sessionId: MainSchema.SessionIdString;
      target: string; // page id
    }
  
    /** vopNavigationDeniedNotification - Host->Player: Host denies navigation @public*/
    export interface NavigationDeniedNotification {
      sessionId: MainSchema.SessionIdString;
      reason?: AllowedPropertiesValues.NavigationDenialReason[];
    }
  
  /** vopPlayerConfigChangedNotification - Host->Player: Host updates player config @public*/
    export interface PlayerConfigChangedNotification {
      sessionId: MainSchema.SessionIdString;
      playerConfig: MainSchema.PlayerConfig;
    }
  
  /** vopWidgetReturn - Host->Player: Sends the return value of a widget call to the player. @public*/
    export interface WidgetReturn {
      sessionId: MainSchema.SessionIdString;
      callId?: string;
      state?: Record<string, string>; // key -> base64 encoded JSON;
    }
  
  }
  
  /** Namespace containing all player send payloads @public*/
  export namespace PlayerSend {
 
     /** vopReadyNotification - Player->Host: Player announces readiness @public*/
    export interface ReadyNotification {
      metadata: string; // Stringified JSON-LD metadata
    }
    
    /** vopStateChangedNotification - Player->Host: Player reports state changes @public*/
    export interface StateChangedNotification {
      sessionId: MainSchema.SessionIdString;
      timeStamp: string;
      unitState?: MainSchema.UnitState;
      playerState?: MainSchema.PlayerState;
      log?: MainSchema.LogEntry[];
      }

    /** vopUnitNavigationRequestedNotification - Player->Host: Player requests unit navigation @public*/
    export interface UnitNavigationRequestedNotification {
      sessionId: MainSchema.SessionIdString;
      target: MainSchema.NavigationTarget;
    }

    /** vopRuntimeErrorNotification - Player->Host: Player reports runtime error @public*/
    export interface RuntimeErrorNotification {
      sessionId: MainSchema.SessionIdString;
      code: AllowedPropertiesValues.Code;
      message?: string;
    }

    /** vopWidgetCall - Player->Host: The player calls for the execution of a widget.@public*/
    export interface WidgetCall {
      sessionId: MainSchema.SessionIdString;
      callId?: string;
      widgetType?: AllowedPropertiesValues.WidgetType;
      parameters?:MainSchema.WidgetParameter[];
      state?: Record<string, string>; // key -> base64 encoded JSON;
    }

    /** vopWindowFocusChangedNotification - Player->Host: Player reports focus changes @public*/
    export interface WindowFocusChangedNotification {
      timeStamp: string; // ISO 8601
      hasFocus: boolean;
    }
  }

}