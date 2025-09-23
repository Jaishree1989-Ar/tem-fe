import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-filter-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './filter-input.component.html',
  styleUrl: './filter-input.component.less'
})
export class FilterInputComponent {
  @Input() placeholder: string = 'Search...';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() valueChanged = new EventEmitter<string>(); // Optional extra output for changes

  onInputChange(value: string) {
    this.value = value;
    this.valueChange.emit(this.value);
    this.valueChanged.emit(this.value);
  }

  clear() {
    this.onInputChange('');
  }
}
