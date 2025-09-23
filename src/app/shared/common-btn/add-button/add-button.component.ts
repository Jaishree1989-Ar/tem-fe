import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'add-button',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './add-button.component.html',
  styleUrl: './add-button.component.less'
})
/**
 * AddButtonComponent
 *
 * A reusable and customizable standalone button component with optional icon and label.
 * Built using Angular Material, it supports different button types, colors, and disabled state.
 *
 * Inputs:
 * - `label`: Text to display on the button.
 * - `color`: Angular Material color (`primary`, `accent`, `warn`, or custom).
 * - `disabled`: Whether the button is disabled.
 * - `icon`: Optional icon to show (Material icon name).
 * - `type`: Button type (`button`, `submit`, or `reset`).
 *
 * Outputs:
 * - `clicked`: Emits when the button is clicked.
 */
export class AddButtonComponent {
  
  @Input() label: string = 'Click';
  @Input() color: 'primary' | 'accent' | 'warn' | string = 'primary';
  @Input() disabled: boolean = false;
  @Input() icon: string | null = null;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() clicked = new EventEmitter<void>();
}
