import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PanelModule,
    ToastModule,
    FormsModule,
    ButtonModule,
    TableModule,
    ToolbarModule,
    InputTextModule,  
    CheckboxModule,
    TextareaModule 
  ],
  exports: [
    CommonModule,
    PanelModule,
    ToastModule,
    FormsModule,
    ButtonModule,
    TableModule,
    ToolbarModule,
    InputTextModule,
    CheckboxModule,
    TextareaModule 
  ],
  providers: [],
})
export class ShareModule {}
