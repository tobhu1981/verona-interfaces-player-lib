// ============================================================================
// ALLOWED PROPERTY VALUES
// ============================================================================

/**
 * Namespace containing data type definitions used in payloads.
 * These are enums and union types for specific fields.
 * @public
 */
export namespace AllowedPropertiesValues {

  /** Progress indicator for presentation and responses */
  export type Progress = 'none' | 'some' | 'complete';

  /** Log policy levels */
  export type LogPolicy = 'disabled' | 'lean' | 'rich' | 'debug';

  /** Paging modes for unit presentation */
  export type PagingMode = 'separate' | 'buttons' | 'concat-scroll' | 'concat-scroll-snap';

  /** Print mode options */
  export type PrintMode = 'off' | 'on' | 'on-with-ids';

  /** Navigation denial reasons */
  export type NavigationDenialReason = 'presentationIncomplete' | 'responsesIncomplete';

   /** Widget Call */
  export type WidgetType = 'WIDGET_CALC' | 'WIDGET_PERIODIC_TABLE' | 'WIDGET_MOLECULE_EDITOR' | 'UNIT';

   /** Code values runtime error */
  export type Code = 'AUDIO_CORRUPT' | 'GEOGEBRA_CRASH';
}