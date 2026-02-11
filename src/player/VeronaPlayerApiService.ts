// ============================================================================
// VERONA PLAYER API-SERVICE CLASS
// ============================================================================

import {
  VeronaOperations,
  VeronaMessage,
  PayloadInterfacesProperties,
  MainSchema
} from '../types';
import { DEFAULT_TARGET_ORIGIN } from '../constants';
import { isVeronaMessage } from '../utils';

/**
 * Player configuration options
 * @public
 */
export interface VeronaPlayerOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Allowed origin for postMessage security */
  allowedOrigin?: string;
}

/**
 * Typed message data for start command
 * @public
 */
export interface StartCommandData extends PayloadInterfacesProperties.PlayerReceive.StartCommand {
  type: typeof VeronaOperations.START_COMMAND;
}

/**
 * Typed message data for page navigation command
 * @public
 */
export interface PageNavigationCommandData extends PayloadInterfacesProperties.PlayerReceive.PageNavigationCommand {
  type: typeof VeronaOperations.PAGE_NAVIGATION_COMMAND;
}

/**
 * Typed message data for navigation denied notification
 * @public
 */
export interface NavigationDeniedNotificationData extends PayloadInterfacesProperties.PlayerReceive.NavigationDeniedNotification {
  type: typeof VeronaOperations.NAVIGATION_DENIED_NOTIFICATION;
}

/**
 * Typed message data for player config changed notification
 * @public
 */
export interface PlayerConfigChangedNotificationData extends PayloadInterfacesProperties.PlayerReceive.PlayerConfigChangedNotification {
  type: typeof VeronaOperations.PLAYER_CONFIG_CHANGED_NOTIFICATION;
}

/**
 * Typed message data for widget return
 * @public
 */
export interface WidgetReturnData extends PayloadInterfacesProperties.PlayerReceive.WidgetReturn {
  type: typeof VeronaOperations.WIDGET_RETURN;
}

/**
 * Verona Player Interface
 * Handles communication between player and host application
 * 
 * @public
 */
export class VeronaPlayerApiService {
  private messageHandlers: Map<string, Set<Function>> = new Map();
  private sessionId: string | null = null;
  private debug: boolean;
  private allowedOrigin: string;
  private targetWindow: Window;
  private messageListener: (event: MessageEvent) => void;

  constructor(options: VeronaPlayerOptions = {}) {
    this.debug = options.debug ?? false;
    this.allowedOrigin = options.allowedOrigin ?? DEFAULT_TARGET_ORIGIN;
    this.targetWindow = window.parent;

    // Store reference to listener for cleanup
    this.messageListener = (event: MessageEvent) => {
      this.handleMessage(event);
    };

    // Register global message listener
    window.addEventListener('message', (event: MessageEvent) => {
      this.handleMessage(event);
    });
  }

  // ============================================================================
  // PUBLIC API - SENDING MESSAGES
  // ============================================================================

  /**
   * Send ready notification to host
   * @public
   */
  sendReady(data: PayloadInterfacesProperties.PlayerSend.ReadyNotification): void {
    this.postMessage(VeronaOperations.READY_NOTIFICATION, data);
  }

  /**
   * Send state changed notification to host
   * @public
   */
  sendStateChanged(
    unitState?: MainSchema.UnitState,
    playerState?: MainSchema.PlayerState,
    log?: MainSchema.LogEntry[]
  ): void {
    if (!this.sessionId) {
      this.warn('Cannot send state changed without sessionId');
      return;
    }

    const data: PayloadInterfacesProperties.PlayerSend.StateChangedNotification = {
      sessionId: this.sessionId,
      timeStamp: new Date().toISOString(),
      unitState,
      playerState,
      log
    };

    this.postMessage(VeronaOperations.STATE_CHANGED_NOTIFICATION, data);
  }

  /**
   * Send unit navigation request to host
   * @public
   */
  sendUnitNavigationRequest(target: MainSchema.NavigationTarget): void {
    if (!this.sessionId) {
      this.warn('Cannot send navigation request without sessionId');
      return;
    }

    const data: PayloadInterfacesProperties.PlayerSend.UnitNavigationRequestedNotification = {
      sessionId: this.sessionId,
      target
    };

    this.postMessage(VeronaOperations.UNIT_NAVIGATION_REQUESTED_NOTIFICATION, data);
  }

  /**
   * Send runtime error notification to host
   * @public
   */
  sendRuntimeError(code: string, message?: string): void {
    if (!this.sessionId) {
      this.warn('Cannot send runtime error without sessionId');
      return;
    }

    const data: PayloadInterfacesProperties.PlayerSend.RuntimeErrorNotification = {
      sessionId: this.sessionId,
      code: code as any,
      message
    };

    this.postMessage(VeronaOperations.RUNTIME_ERROR_NOTIFICATION, data);
  }

  /**
   * Send widget call to host
   * @public
   */
  sendWidgetCall(
    widgetType: string,
    parameters?: MainSchema.WidgetParameter[],
    state?: Record<string, string>,
    callId?: string
  ): void {
    if (!this.sessionId) {
      this.warn('Cannot send widget call without sessionId');
      return;
    }

    const data: PayloadInterfacesProperties.PlayerSend.WidgetCall = {
      sessionId: this.sessionId,
      callId,
      widgetType: widgetType as any,
      parameters,
      state
    };

    this.postMessage(VeronaOperations.WIDGET_CALL, data);
  }

  /**
   * Send window focus changed notification
   * @public
   */
  sendWindowFocusChanged(hasFocus: boolean): void {
    const data: PayloadInterfacesProperties.PlayerSend.WindowFocusChangedNotification = {
      timeStamp: new Date().toISOString(),
      hasFocus
    };

    this.postMessage(VeronaOperations.WINDOW_FOCUS_CHANGED_NOTIFICATION, data);
  }

  // ============================================================================
  // PUBLIC API - REGISTERING HANDLERS
  // ============================================================================

  /**
   * Register handler for start command
   * @public
   */
  onStartCommand(callback: (data: StartCommandData) => void): void {
    this.on(VeronaOperations.START_COMMAND, (data: StartCommandData) => {
       if (data.sessionId) {
      this.sessionId = data.sessionId;
      callback(data);
    } else {
      console.warn("Verona: START_COMMAND ohne sessionId erhalten!");
    }
    });
  }

  /**
   * Register handler for page navigation command
   * @public
   */
  onPageNavigationCommand(callback: (data: PageNavigationCommandData) => void): void {
    this.on(VeronaOperations.PAGE_NAVIGATION_COMMAND, callback);
  }

  /**
   * Register handler for navigation denied notification
   * @public
   */
  onNavigationDenied(callback: (data: NavigationDeniedNotificationData) => void): void {
    this.on(VeronaOperations.NAVIGATION_DENIED_NOTIFICATION, callback);
  }

  /**
   * Register handler for player config changed notification
   * @public
   */
  onPlayerConfigChanged(callback: (data: PlayerConfigChangedNotificationData) => void): void {
    this.on(VeronaOperations.PLAYER_CONFIG_CHANGED_NOTIFICATION, callback);
  }

  /**
   * Register handler for widget return
   * @public
   */
  onWidgetReturn(callback: (data: WidgetReturnData) => void): void {
    this.on(VeronaOperations.WIDGET_RETURN, callback);
  }

  // ============================================================================
  // INTERNAL METHODS
  // ============================================================================

  /**
   * Send a postMessage to the host window
   * @internal
   */
  private postMessage(type: string, data: any): void {
    const message: VeronaMessage = {
      type: type as any,
      ...data
    };

    this.targetWindow.postMessage(message, this.allowedOrigin);

    if (this.debug) {
      console.log('[VeronaPlayer] Sent:', message);
    }
  }

  /**
   * Handle incoming postMessage
   * @internal
   */
  private handleMessage(event: MessageEvent): void {
    // Validate origin if specified
    if (this.allowedOrigin !== '*' && event.origin !== this.allowedOrigin) {
      this.warn(`Message from invalid origin: ${event.origin}`);
      return;
    }

    // Validate message structure
    if (!isVeronaMessage(event.data)) {
      return; // Silently ignore non-Verona messages
    }

    const data = event.data;

    if (this.debug) {
      console.log('[VeronaPlayer] Received:', data);
    }

    // Validate sessionId for commands that require it
    if (this.sessionId && data.sessionId && data.sessionId !== this.sessionId) {
      this.warn(`SessionId mismatch: expected ${this.sessionId}, got ${data.sessionId}`);
      return;
    }

    // Trigger registered handlers
    const handlers = this.messageHandlers.get(data.type);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  /**
   * Register a message handler
   * @internal
   */
  private on(type: string, callback: Function): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(callback);
  }

  /**
   * Log a warning message if debug is enabled
   * @internal
   */
  private warn(message: string): void {
    if (this.debug) {
      console.warn('[VeronaPlayer]', message);
    }
  }

  /**
   * Optional: Clean up resources and remove event listeners.
   * Call this when the player is no longer needed (e.g., in ngOnDestroy).
   * 
   * @public
   * 
   */
  public destroy(): void {
    // Remove message listener
    window.removeEventListener('message', this.messageListener);
    
    // Clear all registered handlers
    this.messageHandlers.clear();
    
    // Clear session
    this.sessionId = null;
    
    if (this.debug) {
      console.log('[VeronaPlayer] Destroyed');
    }
  }
}