// ============================================================================
// VERONA SCHEMAS
// ============================================================================

import { AllowedPropertiesValues } from './values';

/** Namespace containing sub-schemas. @public*/
export namespace SubSchema {

  /** Page information (used in PlayerState.validPages) @public*/
  export interface validPages {
    id: string;
    label?: string;
  }
}

/** Namespace containing main-schemas. @public*/
export namespace MainSchema {
 
   /** Session ID string type. Unique identifier for the current player session. @public*/
  export type SessionIdString = string;

   /** Navigation targets relative to current unit position */
  export type NavigationTarget = 'next' | 'previous' | 'first' | 'last' | 'end';

 /** Shared parameter for cross-instance communication (used in PlayerConfig and PlayerState) @public */
  export interface SharedParameter {
    key: string; // >= 2 characters
    value?: string;
  }

  /** Log entry structure (used in StateChangedNotification.log) @public*/
  export interface LogEntry {
    timeStamp: string; // ISO 8601 date-time
    key: string;
    content?: string; // base64 encoded
  }
   
   /** Unit state containing response data. @public*/
  export interface UnitState {
    dataParts?: Record<string, string>; // key -> base64 encoded JSON
    presentationProgress?: AllowedPropertiesValues.Progress;
    responseProgress?: AllowedPropertiesValues.Progress;
    unitStateDataType?: string;
  }

   /** Player configuration. Controls player behavior and presentation. @public*/
  export interface PlayerConfig {
    unitNumber?: number; // >= 1
    unitTitle?: string; // <= 50 chars
    unitId?: string; // <= 20 chars
    logPolicy?: AllowedPropertiesValues.LogPolicy;
    pagingMode?: AllowedPropertiesValues.PagingMode;
    printMode?: AllowedPropertiesValues.PrintMode;
    enabledNavigationTargets?: MainSchema.NavigationTarget[];
    startPage?: string;
    directDownloadUrl?: string;
    sharedParameters?: SharedParameter[];
  }

  /** Player state with page information. Sent by player to inform host about current page state. @public*/
  export interface PlayerState {
    validPages?: SubSchema.validPages[];
    currentPage?: string;
    sharedParameters?: SharedParameter[];
  }
 
  /** Player state with page information. Sent by player to inform host about current page state. @public*/
  export interface WidgetParameter {
    key: String; //>=2 characters
    value?: string;
  }
}