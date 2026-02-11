## Einbinden der Lib in `app.component.ts` 

### `verona-api.service.ts` entfällt nach Einbindung!

```typescript

import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FileService } from 'common/services/file.service';
import { Unit } from 'common/interfaces/unit';
import { UnitViewComponent } from './unit-view.component';

import { VeronaPlayerApiService, encodeBase64 , decodeBase64, UnitState} from '@verona-interfaces/player';

@Component({
  selector: 'speedtest-player',
  imports: [CommonModule, UnitViewComponent, MatButton, MatIcon],
  template: `
    <button *ngIf="isStandalone" mat-raised-button class="load-button" (click)="upload.click()">
      Unit laden
      <mat-icon>file_upload</mat-icon>
    </button>

    <input type="file" hidden accept=".json, .voud" #upload
           (change)="loadUnitFromFile($event.target)">

    <speedtest-player-unit-view *ngIf="unit && unit.questions.length > 0 && !showOutroPage"
                                [question]="unit.questions[activeQuestionIndex]"
                                [unit]="unit"
                                (responseGiven)="onResponse($event)">
    </speedtest-player-unit-view>

    <div *ngIf="showOutroPage" class="outro">
      Keine weiteren Seiten. Weiterleitung zur nächsten Unit...
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100vh;
    }
    .load-button {
      position: absolute;
      right: 0;
    }
    .outro {
      margin: auto;
      font-size: x-large;
    }
  `
})
export class AppComponent implements OnInit, OnDestroy {
  private veronaPlayer!: VeronaPlayerApiService;

  isStandalone = window === window.parent;
  unit: Unit | undefined;
  activeQuestionIndex: number = 0;
  activeQuestionStartTime: number = Date.now();
  showOutroPage: boolean = false;
  sumCorrect: number = 0;
  sumWrong: number = 0;

  ngOnInit(): void {
    this.initializeVeronaPlayer();
  }

  ngOnDestroy(): void {
    this.veronaPlayer.destroy();
  }

  /**
   * Initialize Verona Player and register handlers
   */
  private initializeVeronaPlayer(): void {
    // Get metadata from DOM
    const metadata: string | null | undefined = document.getElementById('verona-metadata')?.textContent;
    //console.log(VERONA_SPEC_VERSION);
    this.veronaPlayer = new VeronaPlayerApiService({
      debug: true,
      allowedOrigin: '*'
    });

    // Register start handler
    this.veronaPlayer.onStartCommand((command) => {
      if (!command.unitDefinition) return;
      
      this.resetUnitState();
      
      // Wait for child component to be destroyed
      setTimeout(() => {
        this.unit = JSON.parse(command.unitDefinition!) as Unit;
        
        // Restore previous state if available
        if (command.unitState?.dataParts !== undefined && Object.keys(command.unitState.dataParts).length > 0) {
          this.restoreState(command.unitState);
        }
        
        // Check if unit is already complete
        if (this.activeQuestionIndex >= this.unit!.questions.length) {
          this.showOutroPage = true;
        }
        
        // Send initial state
        this.sendEmptyState();
      });
    });

    // Send ready notification
      this.veronaPlayer.sendReady({
        metadata: metadata ? JSON.parse(metadata) : {}
    });
  }

  /**
   * Load unit from file (standalone mode)
   */
  async loadUnitFromFile(eventTarget: EventTarget | null): Promise<void> {
    this.resetUnitState();
    const loadedUnit = await FileService.readFileAsText(
      (eventTarget as HTMLInputElement).files?.[0] as File
    );
    this.unit = JSON.parse(loadedUnit);
  }

  /**
   * Reset all unit state
   */
  private resetUnitState(): void {
    this.unit = undefined;
    this.activeQuestionIndex = 0;
    this.activeQuestionStartTime = Date.now();
    this.showOutroPage = false;
    this.sumCorrect = 0;
    this.sumWrong = 0;
  }
  
  /**
   * Restore state from previous session
   */
  private restoreState(unitState: UnitState): void {
    if (!unitState.dataParts) return;

    try {
      // Restore active question index
      if (unitState.dataParts['activeQuestionIndex']) {
        const data = decodeBase64<Array<{value: number}>>(unitState.dataParts['activeQuestionIndex']);
        // Add 1 because activeQuestionIndex has already been seen and answered
        this.activeQuestionIndex = Number(data[0].value) + 1;
      }

      // Restore sums
      if (unitState.dataParts['sums']) {
        const data = decodeBase64<Array<{id: string, value: number}>>(unitState.dataParts['sums']);
        this.sumCorrect = Number(data[0].value);
        this.sumWrong = Number(data[1].value);
      }
    } catch (error) {
      console.error('Error restoring state:', error);
    }
  }

  /**
   * Handle user response
   */
  onResponse(answer: number | number[]) {
    const isCorrect = this.getIsCorrect(
      answer, 
      this.unit?.questions[this.activeQuestionIndex].correctAnswer
    );
    
    if (isCorrect !== undefined) {
      this.updateResultSums(isCorrect);
    }
    
    // Send state via Verona Lib
    this.sendResponseState(answer, isCorrect);
    
    this.gotoNextQuestion();
  }

  /**
   * Check if answer is correct
   */
  private getIsCorrect(
    answer: number | number[],
    correctAnswer: number | number[] | undefined
  ): boolean | undefined {
    if (correctAnswer === undefined) return undefined;
    return JSON.stringify(answer) === JSON.stringify(correctAnswer);
  }

  /**
   * Update result sums
   */
  private updateResultSums(isCorrect: boolean): void {
    isCorrect ? this.sumCorrect += 1 : this.sumWrong += 1;
  }

  /**
   * Send response state to host
   */
  private sendResponseState(answerValue: number | number[], isCorrect?: boolean): void {
    const code = isCorrect === undefined ? undefined : (isCorrect ? 1 : 0);

    // Prepare response data for current question
    const questionResponse = [
      {
        id: 'value',
        status: 'CODING_COMPLETE',
        value: answerValue,
        subform: String(this.activeQuestionIndex),
        code,
        score: code
      },
      {
        id: 'time',
        status: 'VALUE_CHANGED',
        value: Date.now() - this.activeQuestionStartTime,
        subform: String(this.activeQuestionIndex)
      }
    ];

    // Prepare sums
    const sums = [
      {
        id: 'total_correct',
        status: 'VALUE_CHANGED',
        value: this.sumCorrect
      },
      {
        id: 'total_wrong',
        status: 'VALUE_CHANGED',
        value: this.sumWrong
      }
    ];

    // Prepare active question index
    const activeIndex = [{
      id: 'activeQuestionIndex',
      status: 'VALUE_CHANGED',
      value: this.activeQuestionIndex
    }];

    // Create UnitState with base64 encoded data
    const unitState: UnitState = {
      dataParts: {
        [`question_${this.activeQuestionIndex}`]: encodeBase64(questionResponse),
        'sums': encodeBase64(sums),
        'activeQuestionIndex': encodeBase64(activeIndex)
      },
      presentationProgress: 'complete',
      responseProgress: 'complete',
      unitStateDataType: 'iqb-standard@1.0'
    };

    // Send via Verona Player
    this.veronaPlayer.sendStateChanged(unitState);
  }

  /**
   * Send empty initial state
   */
  private sendEmptyState(): void {
    const unitState: UnitState = {
      dataParts: {},
      presentationProgress: 'complete',
      responseProgress: 'none',
      unitStateDataType: 'iqb-standard@1.0'
    };

    this.veronaPlayer.sendStateChanged(unitState);
  }

  /**
   * Navigate to next question or finish
   */
  private gotoNextQuestion(): void {
    if (!this.unit) throw Error();
    
    if (this.unit.questions.length > this.activeQuestionIndex + 1) {
      this.activeQuestionIndex += 1;
      this.activeQuestionStartTime = Date.now();
    } else {
      this.showOutroPage = true;
      // Request navigation to next unit
      this.veronaPlayer.sendUnitNavigationRequest('next');
    }
  }
}


```